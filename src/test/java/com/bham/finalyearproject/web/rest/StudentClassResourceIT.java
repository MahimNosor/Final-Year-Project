package com.bham.finalyearproject.web.rest;

import static com.bham.finalyearproject.domain.StudentClassAsserts.*;
import static com.bham.finalyearproject.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.bham.finalyearproject.IntegrationTest;
import com.bham.finalyearproject.domain.StudentClass;
import com.bham.finalyearproject.repository.StudentClassRepository;
import com.bham.finalyearproject.repository.search.StudentClassSearchRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import org.assertj.core.util.IterableUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Streamable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link StudentClassResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class StudentClassResourceIT {

    private static final String DEFAULT_CLASS_NAME = "AAAAAAAAAA";
    private static final String UPDATED_CLASS_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/student-classes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/student-classes/_search";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private StudentClassRepository studentClassRepository;

    @Mock
    private StudentClassRepository studentClassRepositoryMock;

    @Autowired
    private StudentClassSearchRepository studentClassSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restStudentClassMockMvc;

    private StudentClass studentClass;

    private StudentClass insertedStudentClass;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static StudentClass createEntity() {
        return new StudentClass().className(DEFAULT_CLASS_NAME);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static StudentClass createUpdatedEntity() {
        return new StudentClass().className(UPDATED_CLASS_NAME);
    }

    @BeforeEach
    public void initTest() {
        studentClass = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedStudentClass != null) {
            studentClassRepository.delete(insertedStudentClass);
            studentClassSearchRepository.delete(insertedStudentClass);
            insertedStudentClass = null;
        }
    }

    @Test
    @Transactional
    void createStudentClass() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        // Create the StudentClass
        var returnedStudentClass = om.readValue(
            restStudentClassMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentClass)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            StudentClass.class
        );

        // Validate the StudentClass in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertStudentClassUpdatableFieldsEquals(returnedStudentClass, getPersistedStudentClass(returnedStudentClass));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedStudentClass = returnedStudentClass;
    }

    @Test
    @Transactional
    void createStudentClassWithExistingId() throws Exception {
        // Create the StudentClass with an existing ID
        studentClass.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restStudentClassMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentClass)))
            .andExpect(status().isBadRequest());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkClassNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        // set the field null
        studentClass.setClassName(null);

        // Create the StudentClass, which fails.

        restStudentClassMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentClass)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllStudentClasses() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);

        // Get all the studentClassList
        restStudentClassMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(studentClass.getId().intValue())))
            .andExpect(jsonPath("$.[*].className").value(hasItem(DEFAULT_CLASS_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllStudentClassesWithEagerRelationshipsIsEnabled() throws Exception {
        when(studentClassRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restStudentClassMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(studentClassRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllStudentClassesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(studentClassRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restStudentClassMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(studentClassRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getStudentClass() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);

        // Get the studentClass
        restStudentClassMockMvc
            .perform(get(ENTITY_API_URL_ID, studentClass.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(studentClass.getId().intValue()))
            .andExpect(jsonPath("$.className").value(DEFAULT_CLASS_NAME));
    }

    @Test
    @Transactional
    void getNonExistingStudentClass() throws Exception {
        // Get the studentClass
        restStudentClassMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingStudentClass() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentClassSearchRepository.save(studentClass);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());

        // Update the studentClass
        StudentClass updatedStudentClass = studentClassRepository.findById(studentClass.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedStudentClass are not directly saved in db
        em.detach(updatedStudentClass);
        updatedStudentClass.className(UPDATED_CLASS_NAME);

        restStudentClassMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedStudentClass.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedStudentClass))
            )
            .andExpect(status().isOk());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedStudentClassToMatchAllProperties(updatedStudentClass);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<StudentClass> studentClassSearchList = Streamable.of(studentClassSearchRepository.findAll()).toList();
                StudentClass testStudentClassSearch = studentClassSearchList.get(searchDatabaseSizeAfter - 1);

                assertStudentClassAllPropertiesEquals(testStudentClassSearch, updatedStudentClass);
            });
    }

    @Test
    @Transactional
    void putNonExistingStudentClass() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        studentClass.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStudentClassMockMvc
            .perform(
                put(ENTITY_API_URL_ID, studentClass.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(studentClass))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithIdMismatchStudentClass() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        studentClass.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentClassMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(studentClass))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamStudentClass() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        studentClass.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentClassMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentClass)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void partialUpdateStudentClassWithPatch() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the studentClass using partial update
        StudentClass partialUpdatedStudentClass = new StudentClass();
        partialUpdatedStudentClass.setId(studentClass.getId());

        restStudentClassMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStudentClass.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedStudentClass))
            )
            .andExpect(status().isOk());

        // Validate the StudentClass in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertStudentClassUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedStudentClass, studentClass),
            getPersistedStudentClass(studentClass)
        );
    }

    @Test
    @Transactional
    void fullUpdateStudentClassWithPatch() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the studentClass using partial update
        StudentClass partialUpdatedStudentClass = new StudentClass();
        partialUpdatedStudentClass.setId(studentClass.getId());

        partialUpdatedStudentClass.className(UPDATED_CLASS_NAME);

        restStudentClassMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStudentClass.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedStudentClass))
            )
            .andExpect(status().isOk());

        // Validate the StudentClass in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertStudentClassUpdatableFieldsEquals(partialUpdatedStudentClass, getPersistedStudentClass(partialUpdatedStudentClass));
    }

    @Test
    @Transactional
    void patchNonExistingStudentClass() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        studentClass.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStudentClassMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, studentClass.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(studentClass))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithIdMismatchStudentClass() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        studentClass.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentClassMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(studentClass))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamStudentClass() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        studentClass.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentClassMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(studentClass)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the StudentClass in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void deleteStudentClass() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);
        studentClassRepository.save(studentClass);
        studentClassSearchRepository.save(studentClass);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the studentClass
        restStudentClassMockMvc
            .perform(delete(ENTITY_API_URL_ID, studentClass.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(studentClassSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    @Transactional
    void searchStudentClass() throws Exception {
        // Initialize the database
        insertedStudentClass = studentClassRepository.saveAndFlush(studentClass);
        studentClassSearchRepository.save(studentClass);

        // Search the studentClass
        restStudentClassMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + studentClass.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(studentClass.getId().intValue())))
            .andExpect(jsonPath("$.[*].className").value(hasItem(DEFAULT_CLASS_NAME)));
    }

    protected long getRepositoryCount() {
        return studentClassRepository.count();
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

    protected StudentClass getPersistedStudentClass(StudentClass studentClass) {
        return studentClassRepository.findById(studentClass.getId()).orElseThrow();
    }

    protected void assertPersistedStudentClassToMatchAllProperties(StudentClass expectedStudentClass) {
        assertStudentClassAllPropertiesEquals(expectedStudentClass, getPersistedStudentClass(expectedStudentClass));
    }

    protected void assertPersistedStudentClassToMatchUpdatableProperties(StudentClass expectedStudentClass) {
        assertStudentClassAllUpdatablePropertiesEquals(expectedStudentClass, getPersistedStudentClass(expectedStudentClass));
    }
}
