package com.bham.finalyearproject.web.rest;

import static com.bham.finalyearproject.domain.TestCaseAsserts.*;
import static com.bham.finalyearproject.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.bham.finalyearproject.IntegrationTest;
import com.bham.finalyearproject.domain.TestCase;
import com.bham.finalyearproject.repository.TestCaseRepository;
import com.bham.finalyearproject.repository.search.TestCaseSearchRepository;
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
 * Integration tests for the {@link TestCaseResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TestCaseResourceIT {

    private static final String DEFAULT_INPUT = "AAAAAAAAAA";
    private static final String UPDATED_INPUT = "BBBBBBBBBB";

    private static final String DEFAULT_EXPECTED_OUTPUT = "AAAAAAAAAA";
    private static final String UPDATED_EXPECTED_OUTPUT = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/test-cases";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/test-cases/_search";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private TestCaseSearchRepository testCaseSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTestCaseMockMvc;

    private TestCase testCase;

    private TestCase insertedTestCase;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TestCase createEntity() {
        return new TestCase().input(DEFAULT_INPUT).expectedOutput(DEFAULT_EXPECTED_OUTPUT).description(DEFAULT_DESCRIPTION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TestCase createUpdatedEntity() {
        return new TestCase().input(UPDATED_INPUT).expectedOutput(UPDATED_EXPECTED_OUTPUT).description(UPDATED_DESCRIPTION);
    }

    @BeforeEach
    public void initTest() {
        testCase = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedTestCase != null) {
            testCaseRepository.delete(insertedTestCase);
            testCaseSearchRepository.delete(insertedTestCase);
            insertedTestCase = null;
        }
    }

    @Test
    @Transactional
    void createTestCase() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        // Create the TestCase
        var returnedTestCase = om.readValue(
            restTestCaseMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testCase)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TestCase.class
        );

        // Validate the TestCase in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertTestCaseUpdatableFieldsEquals(returnedTestCase, getPersistedTestCase(returnedTestCase));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedTestCase = returnedTestCase;
    }

    @Test
    @Transactional
    void createTestCaseWithExistingId() throws Exception {
        // Create the TestCase with an existing ID
        testCase.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restTestCaseMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testCase)))
            .andExpect(status().isBadRequest());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkInputIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        // set the field null
        testCase.setInput(null);

        // Create the TestCase, which fails.

        restTestCaseMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testCase)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkExpectedOutputIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        // set the field null
        testCase.setExpectedOutput(null);

        // Create the TestCase, which fails.

        restTestCaseMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testCase)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllTestCases() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);

        // Get all the testCaseList
        restTestCaseMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(testCase.getId().intValue())))
            .andExpect(jsonPath("$.[*].input").value(hasItem(DEFAULT_INPUT)))
            .andExpect(jsonPath("$.[*].expectedOutput").value(hasItem(DEFAULT_EXPECTED_OUTPUT)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getTestCase() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);

        // Get the testCase
        restTestCaseMockMvc
            .perform(get(ENTITY_API_URL_ID, testCase.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(testCase.getId().intValue()))
            .andExpect(jsonPath("$.input").value(DEFAULT_INPUT))
            .andExpect(jsonPath("$.expectedOutput").value(DEFAULT_EXPECTED_OUTPUT))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingTestCase() throws Exception {
        // Get the testCase
        restTestCaseMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTestCase() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        testCaseSearchRepository.save(testCase);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());

        // Update the testCase
        TestCase updatedTestCase = testCaseRepository.findById(testCase.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTestCase are not directly saved in db
        em.detach(updatedTestCase);
        updatedTestCase.input(UPDATED_INPUT).expectedOutput(UPDATED_EXPECTED_OUTPUT).description(UPDATED_DESCRIPTION);

        restTestCaseMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTestCase.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedTestCase))
            )
            .andExpect(status().isOk());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTestCaseToMatchAllProperties(updatedTestCase);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<TestCase> testCaseSearchList = Streamable.of(testCaseSearchRepository.findAll()).toList();
                TestCase testTestCaseSearch = testCaseSearchList.get(searchDatabaseSizeAfter - 1);

                assertTestCaseAllPropertiesEquals(testTestCaseSearch, updatedTestCase);
            });
    }

    @Test
    @Transactional
    void putNonExistingTestCase() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        testCase.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTestCaseMockMvc
            .perform(
                put(ENTITY_API_URL_ID, testCase.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testCase))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithIdMismatchTestCase() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        testCase.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestCaseMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(testCase))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTestCase() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        testCase.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestCaseMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testCase)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void partialUpdateTestCaseWithPatch() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testCase using partial update
        TestCase partialUpdatedTestCase = new TestCase();
        partialUpdatedTestCase.setId(testCase.getId());

        partialUpdatedTestCase.input(UPDATED_INPUT);

        restTestCaseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTestCase.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTestCase))
            )
            .andExpect(status().isOk());

        // Validate the TestCase in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTestCaseUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedTestCase, testCase), getPersistedTestCase(testCase));
    }

    @Test
    @Transactional
    void fullUpdateTestCaseWithPatch() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testCase using partial update
        TestCase partialUpdatedTestCase = new TestCase();
        partialUpdatedTestCase.setId(testCase.getId());

        partialUpdatedTestCase.input(UPDATED_INPUT).expectedOutput(UPDATED_EXPECTED_OUTPUT).description(UPDATED_DESCRIPTION);

        restTestCaseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTestCase.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTestCase))
            )
            .andExpect(status().isOk());

        // Validate the TestCase in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTestCaseUpdatableFieldsEquals(partialUpdatedTestCase, getPersistedTestCase(partialUpdatedTestCase));
    }

    @Test
    @Transactional
    void patchNonExistingTestCase() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        testCase.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTestCaseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, testCase.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testCase))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTestCase() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        testCase.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestCaseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testCase))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTestCase() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        testCase.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestCaseMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(testCase)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TestCase in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void deleteTestCase() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);
        testCaseRepository.save(testCase);
        testCaseSearchRepository.save(testCase);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the testCase
        restTestCaseMockMvc
            .perform(delete(ENTITY_API_URL_ID, testCase.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(testCaseSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    @Transactional
    void searchTestCase() throws Exception {
        // Initialize the database
        insertedTestCase = testCaseRepository.saveAndFlush(testCase);
        testCaseSearchRepository.save(testCase);

        // Search the testCase
        restTestCaseMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + testCase.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(testCase.getId().intValue())))
            .andExpect(jsonPath("$.[*].input").value(hasItem(DEFAULT_INPUT)))
            .andExpect(jsonPath("$.[*].expectedOutput").value(hasItem(DEFAULT_EXPECTED_OUTPUT)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    protected long getRepositoryCount() {
        return testCaseRepository.count();
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

    protected TestCase getPersistedTestCase(TestCase testCase) {
        return testCaseRepository.findById(testCase.getId()).orElseThrow();
    }

    protected void assertPersistedTestCaseToMatchAllProperties(TestCase expectedTestCase) {
        assertTestCaseAllPropertiesEquals(expectedTestCase, getPersistedTestCase(expectedTestCase));
    }

    protected void assertPersistedTestCaseToMatchUpdatableProperties(TestCase expectedTestCase) {
        assertTestCaseAllUpdatablePropertiesEquals(expectedTestCase, getPersistedTestCase(expectedTestCase));
    }
}
