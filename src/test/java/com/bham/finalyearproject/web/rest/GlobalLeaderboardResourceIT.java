package com.bham.finalyearproject.web.rest;

import static com.bham.finalyearproject.domain.GlobalLeaderboardAsserts.*;
import static com.bham.finalyearproject.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.bham.finalyearproject.IntegrationTest;
import com.bham.finalyearproject.domain.GlobalLeaderboard;
import com.bham.finalyearproject.repository.GlobalLeaderboardRepository;
import com.bham.finalyearproject.repository.search.GlobalLeaderboardSearchRepository;
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
 * Integration tests for the {@link GlobalLeaderboardResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class GlobalLeaderboardResourceIT {

    private static final Integer DEFAULT_RANK = 1;
    private static final Integer UPDATED_RANK = 2;

    private static final Integer DEFAULT_TOTAL_POINTS = 1;
    private static final Integer UPDATED_TOTAL_POINTS = 2;

    private static final String ENTITY_API_URL = "/api/global-leaderboards";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/global-leaderboards/_search";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private GlobalLeaderboardRepository globalLeaderboardRepository;

    @Autowired
    private GlobalLeaderboardSearchRepository globalLeaderboardSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGlobalLeaderboardMockMvc;

    private GlobalLeaderboard globalLeaderboard;

    private GlobalLeaderboard insertedGlobalLeaderboard;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GlobalLeaderboard createEntity() {
        return new GlobalLeaderboard().rank(DEFAULT_RANK).totalPoints(DEFAULT_TOTAL_POINTS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GlobalLeaderboard createUpdatedEntity() {
        return new GlobalLeaderboard().rank(UPDATED_RANK).totalPoints(UPDATED_TOTAL_POINTS);
    }

    @BeforeEach
    public void initTest() {
        globalLeaderboard = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedGlobalLeaderboard != null) {
            globalLeaderboardRepository.delete(insertedGlobalLeaderboard);
            globalLeaderboardSearchRepository.delete(insertedGlobalLeaderboard);
            insertedGlobalLeaderboard = null;
        }
    }

    @Test
    @Transactional
    void createGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        // Create the GlobalLeaderboard
        var returnedGlobalLeaderboard = om.readValue(
            restGlobalLeaderboardMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(globalLeaderboard)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            GlobalLeaderboard.class
        );

        // Validate the GlobalLeaderboard in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertGlobalLeaderboardUpdatableFieldsEquals(returnedGlobalLeaderboard, getPersistedGlobalLeaderboard(returnedGlobalLeaderboard));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedGlobalLeaderboard = returnedGlobalLeaderboard;
    }

    @Test
    @Transactional
    void createGlobalLeaderboardWithExistingId() throws Exception {
        // Create the GlobalLeaderboard with an existing ID
        globalLeaderboard.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restGlobalLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(globalLeaderboard)))
            .andExpect(status().isBadRequest());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkRankIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        // set the field null
        globalLeaderboard.setRank(null);

        // Create the GlobalLeaderboard, which fails.

        restGlobalLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(globalLeaderboard)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkTotalPointsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        // set the field null
        globalLeaderboard.setTotalPoints(null);

        // Create the GlobalLeaderboard, which fails.

        restGlobalLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(globalLeaderboard)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllGlobalLeaderboards() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);

        // Get all the globalLeaderboardList
        restGlobalLeaderboardMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(globalLeaderboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].rank").value(hasItem(DEFAULT_RANK)))
            .andExpect(jsonPath("$.[*].totalPoints").value(hasItem(DEFAULT_TOTAL_POINTS)));
    }

    @Test
    @Transactional
    void getGlobalLeaderboard() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);

        // Get the globalLeaderboard
        restGlobalLeaderboardMockMvc
            .perform(get(ENTITY_API_URL_ID, globalLeaderboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(globalLeaderboard.getId().intValue()))
            .andExpect(jsonPath("$.rank").value(DEFAULT_RANK))
            .andExpect(jsonPath("$.totalPoints").value(DEFAULT_TOTAL_POINTS));
    }

    @Test
    @Transactional
    void getNonExistingGlobalLeaderboard() throws Exception {
        // Get the globalLeaderboard
        restGlobalLeaderboardMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingGlobalLeaderboard() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        globalLeaderboardSearchRepository.save(globalLeaderboard);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());

        // Update the globalLeaderboard
        GlobalLeaderboard updatedGlobalLeaderboard = globalLeaderboardRepository.findById(globalLeaderboard.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedGlobalLeaderboard are not directly saved in db
        em.detach(updatedGlobalLeaderboard);
        updatedGlobalLeaderboard.rank(UPDATED_RANK).totalPoints(UPDATED_TOTAL_POINTS);

        restGlobalLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGlobalLeaderboard.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedGlobalLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedGlobalLeaderboardToMatchAllProperties(updatedGlobalLeaderboard);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<GlobalLeaderboard> globalLeaderboardSearchList = Streamable.of(globalLeaderboardSearchRepository.findAll()).toList();
                GlobalLeaderboard testGlobalLeaderboardSearch = globalLeaderboardSearchList.get(searchDatabaseSizeAfter - 1);

                assertGlobalLeaderboardAllPropertiesEquals(testGlobalLeaderboardSearch, updatedGlobalLeaderboard);
            });
    }

    @Test
    @Transactional
    void putNonExistingGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        globalLeaderboard.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGlobalLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, globalLeaderboard.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(globalLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithIdMismatchGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        globalLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGlobalLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(globalLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        globalLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGlobalLeaderboardMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(globalLeaderboard)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void partialUpdateGlobalLeaderboardWithPatch() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the globalLeaderboard using partial update
        GlobalLeaderboard partialUpdatedGlobalLeaderboard = new GlobalLeaderboard();
        partialUpdatedGlobalLeaderboard.setId(globalLeaderboard.getId());

        partialUpdatedGlobalLeaderboard.totalPoints(UPDATED_TOTAL_POINTS);

        restGlobalLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGlobalLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGlobalLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the GlobalLeaderboard in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGlobalLeaderboardUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedGlobalLeaderboard, globalLeaderboard),
            getPersistedGlobalLeaderboard(globalLeaderboard)
        );
    }

    @Test
    @Transactional
    void fullUpdateGlobalLeaderboardWithPatch() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the globalLeaderboard using partial update
        GlobalLeaderboard partialUpdatedGlobalLeaderboard = new GlobalLeaderboard();
        partialUpdatedGlobalLeaderboard.setId(globalLeaderboard.getId());

        partialUpdatedGlobalLeaderboard.rank(UPDATED_RANK).totalPoints(UPDATED_TOTAL_POINTS);

        restGlobalLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGlobalLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGlobalLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the GlobalLeaderboard in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGlobalLeaderboardUpdatableFieldsEquals(
            partialUpdatedGlobalLeaderboard,
            getPersistedGlobalLeaderboard(partialUpdatedGlobalLeaderboard)
        );
    }

    @Test
    @Transactional
    void patchNonExistingGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        globalLeaderboard.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGlobalLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, globalLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(globalLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        globalLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGlobalLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(globalLeaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGlobalLeaderboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        globalLeaderboard.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGlobalLeaderboardMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(globalLeaderboard)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the GlobalLeaderboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void deleteGlobalLeaderboard() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);
        globalLeaderboardRepository.save(globalLeaderboard);
        globalLeaderboardSearchRepository.save(globalLeaderboard);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the globalLeaderboard
        restGlobalLeaderboardMockMvc
            .perform(delete(ENTITY_API_URL_ID, globalLeaderboard.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(globalLeaderboardSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    @Transactional
    void searchGlobalLeaderboard() throws Exception {
        // Initialize the database
        insertedGlobalLeaderboard = globalLeaderboardRepository.saveAndFlush(globalLeaderboard);
        globalLeaderboardSearchRepository.save(globalLeaderboard);

        // Search the globalLeaderboard
        restGlobalLeaderboardMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + globalLeaderboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(globalLeaderboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].rank").value(hasItem(DEFAULT_RANK)))
            .andExpect(jsonPath("$.[*].totalPoints").value(hasItem(DEFAULT_TOTAL_POINTS)));
    }

    protected long getRepositoryCount() {
        return globalLeaderboardRepository.count();
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

    protected GlobalLeaderboard getPersistedGlobalLeaderboard(GlobalLeaderboard globalLeaderboard) {
        return globalLeaderboardRepository.findById(globalLeaderboard.getId()).orElseThrow();
    }

    protected void assertPersistedGlobalLeaderboardToMatchAllProperties(GlobalLeaderboard expectedGlobalLeaderboard) {
        assertGlobalLeaderboardAllPropertiesEquals(expectedGlobalLeaderboard, getPersistedGlobalLeaderboard(expectedGlobalLeaderboard));
    }

    protected void assertPersistedGlobalLeaderboardToMatchUpdatableProperties(GlobalLeaderboard expectedGlobalLeaderboard) {
        assertGlobalLeaderboardAllUpdatablePropertiesEquals(
            expectedGlobalLeaderboard,
            getPersistedGlobalLeaderboard(expectedGlobalLeaderboard)
        );
    }
}
