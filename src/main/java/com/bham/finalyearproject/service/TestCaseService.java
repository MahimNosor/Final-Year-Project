package com.bham.finalyearproject.service;

import com.bham.finalyearproject.domain.TestCase;
import com.bham.finalyearproject.repository.TestCaseRepository;
import com.bham.finalyearproject.repository.search.TestCaseSearchRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.bham.finalyearproject.domain.TestCase}.
 */
@Service
@Transactional
public class TestCaseService {

    private static final Logger LOG = LoggerFactory.getLogger(TestCaseService.class);

    private final TestCaseRepository testCaseRepository;

    private final TestCaseSearchRepository testCaseSearchRepository;

    public TestCaseService(TestCaseRepository testCaseRepository, TestCaseSearchRepository testCaseSearchRepository) {
        this.testCaseRepository = testCaseRepository;
        this.testCaseSearchRepository = testCaseSearchRepository;
    }

    /**
     * Save a testCase.
     *
     * @param testCase the entity to save.
     * @return the persisted entity.
     */
    public TestCase save(TestCase testCase) {
        LOG.debug("Request to save TestCase : {}", testCase);
        testCase = testCaseRepository.save(testCase);
        testCaseSearchRepository.index(testCase);
        return testCase;
    }

    /**
     * Update a testCase.
     *
     * @param testCase the entity to save.
     * @return the persisted entity.
     */
    public TestCase update(TestCase testCase) {
        LOG.debug("Request to update TestCase : {}", testCase);
        testCase = testCaseRepository.save(testCase);
        testCaseSearchRepository.index(testCase);
        return testCase;
    }

    /**
     * Partially update a testCase.
     *
     * @param testCase the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TestCase> partialUpdate(TestCase testCase) {
        LOG.debug("Request to partially update TestCase : {}", testCase);

        return testCaseRepository
            .findById(testCase.getId())
            .map(existingTestCase -> {
                if (testCase.getInput() != null) {
                    existingTestCase.setInput(testCase.getInput());
                }
                if (testCase.getExpectedOutput() != null) {
                    existingTestCase.setExpectedOutput(testCase.getExpectedOutput());
                }
                if (testCase.getDescription() != null) {
                    existingTestCase.setDescription(testCase.getDescription());
                }

                return existingTestCase;
            })
            .map(testCaseRepository::save)
            .map(savedTestCase -> {
                testCaseSearchRepository.index(savedTestCase);
                return savedTestCase;
            });
    }

    /**
     * Get all the testCases.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TestCase> findAll(Pageable pageable) {
        LOG.debug("Request to get all TestCases");
        return testCaseRepository.findAll(pageable);
    }

    /**
     * Get one testCase by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TestCase> findOne(Long id) {
        LOG.debug("Request to get TestCase : {}", id);
        return testCaseRepository.findById(id);
    }

    /**
     * Delete the testCase by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TestCase : {}", id);
        testCaseRepository.deleteById(id);
        testCaseSearchRepository.deleteFromIndexById(id);
    }

    /**
     * Search for the testCase corresponding to the query.
     *
     * @param query the query of the search.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TestCase> search(String query, Pageable pageable) {
        LOG.debug("Request to search for a page of TestCases for query {}", query);
        return testCaseSearchRepository.search(query, pageable);
    }
}
