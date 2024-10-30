package com.bham.finalyearproject.web.rest;

import static com.bham.finalyearproject.domain.ClassLeaderboardAsserts.*;
import static com.bham.finalyearproject.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.bham.finalyearproject.IntegrationTest;
import com.bham.finalyearproject.domain.ClassLeaderboard;
import com.bham.finalyearproject.repository.ClassLeaderboardRepository;
import com.bham.finalyearproject.repository.search.ClassLeaderboardSearchRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import org.assertj.core.util.IterableUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.util.Streamable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ClassLeaderboardResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ClassLeaderboardResourceIT {

    private static final Integer DEFAULT_RANK = 1;
    private static final Integer UPDATED_RANK = 2;

    private static final Integer DEFAULT_TOTAL_POINTS = 1;
    private static final Integer UPDATED_TOTAL_POINTS = 2;

    private static final String ENTITY_API_URL = "/api/class-leaderboards";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/class-leaderboards/_search";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ClassLeaderboardRepository classLeaderboardRepository;

    @Autowired
    private ClassLeaderboardSearchRepository classLeaderboardSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClassLeaderboardMockMvc;

    private ClassLeaderboard classLeaderboard;

    private ClassLeaderboard insertedClassLeaderboard;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClassLeaderboard createEntity() {
        return new ClassLeaderboard().rank(DEFAULT_RANK).totalPoints(DEFAULT_TOTAL_POINTS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClassLeaderboard createUpdatedEntity() {
        return new ClassLeaderboard().rank(UPDATED_RANK).totalPoints(UPDATED_TOTAL_POINTS);
    }

    @BeforeEach
    public void initTest() {
        classLeaderboard = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedClassLeaderboard != null) {
            classLeaderboardRepository.delete(insertedClassLeaderboard);
            classLeaderboardSearchRepository.delete(insertedClassLeaderboard);
            insertedClassLeaderboard = null;
        }
    }

    @Test
    @Transactional
    void createClassLeaderboard() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        // Create the ClassLeaderboard
        var returnedClassLeaderboard = om.readValue(
            restClassLeaderboardMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(classLeaderboard)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ClassLeaderboard.class
        );

        // Validate the ClassLeaderboard in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertClassLeaderboardUpdatableFieldsEquals(returnedClassLeaderboard, getPersistedClassLeaderboard(returnedClassLeaderboard));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedClassLeaderboard = returnedClassLeaderboard;
    }

    @Test
    @Transactional
    void createClassLeaderboardWithExistingId() throws Exception {
        // Create the ClassLeaderboard with an existing ID
        classLeaderboard.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restClassLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(classLeaderboard)))
            .andExpect(status().isBadRequest());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkRankIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        // set the field null
        classLeaderboard.setRank(null);

        // Create the ClassLeaderboard, which fails.

        restClassLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(classLeaderboard)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkTotalPointsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        // set the field null
        classLeaderboard.setTotalPoints(null);

        // Create the ClassLeaderboard, which fails.

        restClassLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(classLeaderboard)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllClassLeaderboards() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);

        // Get all the classLeaderboardList
        restClassLeaderboardMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(classLeaderboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].rank").value(hasItem(DEFAULT_RANK)))
            .andExpect(jsonPath("$.[*].totalPoints").value(hasItem(DEFAULT_TOTAL_POINTS)));
    }

    @Test
    @Transactional
    void getClassLeaderboard() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);

        // Get the classLeaderboard
        restClassLeaderboardMockMvc
            .perform(get(ENTITY_API_URL_ID, classLeaderboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(classLeaderboard.getId().intValue()))
            .andExpect(jsonPath("$.rank").value(DEFAULT_RANK))
            .andExpect(jsonPath("$.totalPoints").value(DEFAULT_TOTAL_POINTS));
    }

    @Test
    @Transactional
    void getNonExistingClassLeaderboard() throws Exception {
        // Get the classLeaderboard
        restClassLeaderboardMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingClassLeaderboard() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        classLeaderboardSearchRepository.save(classLeaderboard);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());

        // Update the classLeaderboard
        ClassLeaderboard updatedClassLeaderboard = classLeaderboardRepository.findById(classLeaderboard.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedClassLeaderboard are not directly saved in db
        em.detach(updatedClassLeaderboard);
        updatedClassLeaderboard.rank(UPDATED_RANK).totalPoints(UPDATED_TOTAL_POINTS);

        restClassLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedClassLeaderboard.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedClassLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedClassLeaderboardToMatchAllProperties(updatedClassLeaderboard);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<ClassLeaderboard> classLeaderboardSearchList = Streamable.of(classLeaderboardSearchRepository.findAll()).toList();
                ClassLeaderboard testClassLeaderboardSearch = classLeaderboardSearchList.get(searchDatabaseSizeAfter - 1);

                assertClassLeaderboardAllPropertiesEquals(testClassLeaderboardSearch, updatedClassLeaderboard);
            });
    }

    @Test
    @Transactional
    void putNonExistingClassLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        classLeaderboard.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClassLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, classLeaderboard.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(classLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithIdMismatchClassLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        classLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClassLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(classLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClassLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        classLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClassLeaderboardMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(classLeaderboard)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void partialUpdateClassLeaderboardWithPatch() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the classLeaderboard using partial update
        ClassLeaderboard partialUpdatedClassLeaderboard = new ClassLeaderboard();
        partialUpdatedClassLeaderboard.setId(classLeaderboard.getId());

        partialUpdatedClassLeaderboard.totalPoints(UPDATED_TOTAL_POINTS);

        restClassLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClassLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedClassLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the ClassLeaderboard in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertClassLeaderboardUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedClassLeaderboard, classLeaderboard),
            getPersistedClassLeaderboard(classLeaderboard)
        );
    }

    @Test
    @Transactional
    void fullUpdateClassLeaderboardWithPatch() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the classLeaderboard using partial update
        ClassLeaderboard partialUpdatedClassLeaderboard = new ClassLeaderboard();
        partialUpdatedClassLeaderboard.setId(classLeaderboard.getId());

        partialUpdatedClassLeaderboard.rank(UPDATED_RANK).totalPoints(UPDATED_TOTAL_POINTS);

        restClassLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClassLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedClassLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the ClassLeaderboard in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertClassLeaderboardUpdatableFieldsEquals(
            partialUpdatedClassLeaderboard,
            getPersistedClassLeaderboard(partialUpdatedClassLeaderboard)
        );
    }

    @Test
    @Transactional
    void patchNonExistingClassLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        classLeaderboard.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClassLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, classLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(classLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClassLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        classLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClassLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(classLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClassLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        classLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClassLeaderboardMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(classLeaderboard)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClassLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void deleteClassLeaderboard() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);
        classLeaderboardRepository.save(classLeaderboard);
        classLeaderboardSearchRepository.save(classLeaderboard);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the classLeaderboard
        restClassLeaderboardMockMvc
            .perform(delete(ENTITY_API_URL_ID, classLeaderboard.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(classLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    @Transactional
    void searchClassLeaderboard() throws Exception {
        // Initialize the database
        insertedClassLeaderboard = classLeaderboardRepository.saveAndFlush(classLeaderboard);
        classLeaderboardSearchRepository.save(classLeaderboard);

        // Search the classLeaderboard
        restClassLeaderboardMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + classLeaderboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(classLeaderboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].rank").value(hasItem(DEFAULT_RANK)))
            .andExpect(jsonPath("$.[*].totalPoints").value(hasItem(DEFAULT_TOTAL_POINTS)));
    }

    protected long getRepositoryCount() {
        return classLeaderboardRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected ClassLeaderboard getPersistedClassLeaderboard(ClassLeaderboard classLeaderboard) {
        return classLeaderboardRepository.findById(classLeaderboard.getId()).orElseThrow();
    }

    protected void assertPersistedClassLeaderboardToMatchAllProperties(ClassLeaderboard expectedClassLeaderboard) {
        assertClassLeaderboardAllPropertiesEquals(expectedClassLeaderboard, getPersistedClassLeaderboard(expectedClassLeaderboard));
    }

    protected void assertPersistedClassLeaderboardToMatchUpdatableProperties(ClassLeaderboard expectedClassLeaderboard) {
        assertClassLeaderboardAllUpdatablePropertiesEquals(
            expectedClassLeaderboard,
            getPersistedClassLeaderboard(expectedClassLeaderboard)
        );
    }
}
