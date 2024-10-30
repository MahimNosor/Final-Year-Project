package com.bham.finalyearproject.web.rest;

import com.bham.finalyearproject.domain.TestCase;
import com.bham.finalyearproject.repository.TestCaseRepository;
import com.bham.finalyearproject.service.TestCaseService;
import com.bham.finalyearproject.web.rest.errors.BadRequestAlertException;
import com.bham.finalyearproject.web.rest.errors.ElasticsearchExceptionMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.bham.finalyearproject.domain.TestCase}.
 */
@RestController
@RequestMapping("/api/test-cases")
public class TestCaseResource {

    private static final Logger LOG = LoggerFactory.getLogger(TestCaseResource.class);

    private static final String ENTITY_NAME = "testCase";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TestCaseService testCaseService;

    private final TestCaseRepository testCaseRepository;

    public TestCaseResource(TestCaseService testCaseService, TestCaseRepository testCaseRepository) {
        this.testCaseService = testCaseService;
        this.testCaseRepository = testCaseRepository;
    }

    /**
     * {@code POST  /test-cases} : Create a new testCase.
     *
     * @param testCase the testCase to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new testCase, or with status {@code 400 (Bad Request)} if the testCase has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TestCase> createTestCase(@Valid @RequestBody TestCase testCase) throws URISyntaxException {
        LOG.debug("REST request to save TestCase : {}", testCase);
        if (testCase.getId() != null) {
            throw new BadRequestAlertException("A new testCase cannot already have an ID", ENTITY_NAME, "idexists");
        }
        testCase = testCaseService.save(testCase);
        return ResponseEntity.created(new URI("/api/test-cases/" + testCase.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, testCase.getId().toString()))
            .body(testCase);
    }

    /**
     * {@code PUT  /test-cases/:id} : Updates an existing testCase.
     *
     * @param id the id of the testCase to save.
     * @param testCase the testCase to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated testCase,
     * or with status {@code 400 (Bad Request)} if the testCase is not valid,
     * or with status {@code 500 (Internal Server Error)} if the testCase couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TestCase> updateTestCase(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TestCase testCase
    ) throws URISyntaxException {
        LOG.debug("REST request to update TestCase : {}, {}", id, testCase);
        if (testCase.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, testCase.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!testCaseRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        testCase = testCaseService.update(testCase);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, testCase.getId().toString()))
            .body(testCase);
    }

    /**
     * {@code PATCH  /test-cases/:id} : Partial updates given fields of an existing testCase, field will ignore if it is null
     *
     * @param id the id of the testCase to save.
     * @param testCase the testCase to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated testCase,
     * or with status {@code 400 (Bad Request)} if the testCase is not valid,
     * or with status {@code 404 (Not Found)} if the testCase is not found,
     * or with status {@code 500 (Internal Server Error)} if the testCase couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TestCase> partialUpdateTestCase(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TestCase testCase
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TestCase partially : {}, {}", id, testCase);
        if (testCase.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, testCase.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!testCaseRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TestCase> result = testCaseService.partialUpdate(testCase);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, testCase.getId().toString())
        );
    }

    /**
     * {@code GET  /test-cases} : get all the testCases.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of testCases in body.
     */
    @GetMapping("")
    public ResponseEntity<List<TestCase>> getAllTestCases(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of TestCases");
        Page<TestCase> page = testCaseService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /test-cases/:id} : get the "id" testCase.
     *
     * @param id the id of the testCase to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the testCase, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestCase> getTestCase(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TestCase : {}", id);
        Optional<TestCase> testCase = testCaseService.findOne(id);
        return ResponseUtil.wrapOrNotFound(testCase);
    }

    /**
     * {@code DELETE  /test-cases/:id} : delete the "id" testCase.
     *
     * @param id the id of the testCase to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TestCase : {}", id);
        testCaseService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /test-cases/_search?query=:query} : search for the testCase corresponding
     * to the query.
     *
     * @param query the query of the testCase search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public ResponseEntity<List<TestCase>> searchTestCases(
        @RequestParam("query") String query,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to search for a page of TestCases for query {}", query);
        try {
            Page<TestCase> page = testCaseService.search(query, pageable);
            HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
            return ResponseEntity.ok().headers(headers).body(page.getContent());
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}
