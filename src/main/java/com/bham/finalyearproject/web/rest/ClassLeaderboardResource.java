package com.bham.finalyearproject.web.rest;

import com.bham.finalyearproject.domain.ClassLeaderboard;
import com.bham.finalyearproject.repository.ClassLeaderboardRepository;
import com.bham.finalyearproject.repository.search.ClassLeaderboardSearchRepository;
import com.bham.finalyearproject.web.rest.errors.BadRequestAlertException;
import com.bham.finalyearproject.web.rest.errors.ElasticsearchExceptionMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.bham.finalyearproject.domain.ClassLeaderboard}.
 */
@RestController
@RequestMapping("/api/class-leaderboards")
@Transactional
public class ClassLeaderboardResource {

    private static final Logger LOG = LoggerFactory.getLogger(ClassLeaderboardResource.class);

    private static final String ENTITY_NAME = "classLeaderboard";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClassLeaderboardRepository classLeaderboardRepository;

    private final ClassLeaderboardSearchRepository classLeaderboardSearchRepository;

    public ClassLeaderboardResource(
        ClassLeaderboardRepository classLeaderboardRepository,
        ClassLeaderboardSearchRepository classLeaderboardSearchRepository
    ) {
        this.classLeaderboardRepository = classLeaderboardRepository;
        this.classLeaderboardSearchRepository = classLeaderboardSearchRepository;
    }

    /**
     * {@code POST  /class-leaderboards} : Create a new classLeaderboard.
     *
     * @param classLeaderboard the classLeaderboard to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new classLeaderboard, or with status {@code 400 (Bad Request)} if the classLeaderboard has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ClassLeaderboard> createClassLeaderboard(@Valid @RequestBody ClassLeaderboard classLeaderboard)
        throws URISyntaxException {
        LOG.debug("REST request to save ClassLeaderboard : {}", classLeaderboard);
        if (classLeaderboard.getId() != null) {
            throw new BadRequestAlertException("A new classLeaderboard cannot already have an ID", ENTITY_NAME, "idexists");
        }
        classLeaderboard = classLeaderboardRepository.save(classLeaderboard);
        classLeaderboardSearchRepository.index(classLeaderboard);
        return ResponseEntity.created(new URI("/api/class-leaderboards/" + classLeaderboard.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, classLeaderboard.getId().toString()))
            .body(classLeaderboard);
    }

    /**
     * {@code PUT  /class-leaderboards/:id} : Updates an existing classLeaderboard.
     *
     * @param id the id of the classLeaderboard to save.
     * @param classLeaderboard the classLeaderboard to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated classLeaderboard,
     * or with status {@code 400 (Bad Request)} if the classLeaderboard is not valid,
     * or with status {@code 500 (Internal Server Error)} if the classLeaderboard couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClassLeaderboard> updateClassLeaderboard(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ClassLeaderboard classLeaderboard
    ) throws URISyntaxException {
        LOG.debug("REST request to update ClassLeaderboard : {}, {}", id, classLeaderboard);
        if (classLeaderboard.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, classLeaderboard.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!classLeaderboardRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        classLeaderboard = classLeaderboardRepository.save(classLeaderboard);
        classLeaderboardSearchRepository.index(classLeaderboard);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, classLeaderboard.getId().toString()))
            .body(classLeaderboard);
    }

    /**
     * {@code PATCH  /class-leaderboards/:id} : Partial updates given fields of an existing classLeaderboard, field will ignore if it is null
     *
     * @param id the id of the classLeaderboard to save.
     * @param classLeaderboard the classLeaderboard to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated classLeaderboard,
     * or with status {@code 400 (Bad Request)} if the classLeaderboard is not valid,
     * or with status {@code 404 (Not Found)} if the classLeaderboard is not found,
     * or with status {@code 500 (Internal Server Error)} if the classLeaderboard couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ClassLeaderboard> partialUpdateClassLeaderboard(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClassLeaderboard classLeaderboard
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ClassLeaderboard partially : {}, {}", id, classLeaderboard);
        if (classLeaderboard.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, classLeaderboard.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!classLeaderboardRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClassLeaderboard> result = classLeaderboardRepository
            .findById(classLeaderboard.getId())
            .map(existingClassLeaderboard -> {
                if (classLeaderboard.getRank() != null) {
                    existingClassLeaderboard.setRank(classLeaderboard.getRank());
                }
                if (classLeaderboard.getTotalPoints() != null) {
                    existingClassLeaderboard.setTotalPoints(classLeaderboard.getTotalPoints());
                }

                return existingClassLeaderboard;
            })
            .map(classLeaderboardRepository::save)
            .map(savedClassLeaderboard -> {
                classLeaderboardSearchRepository.index(savedClassLeaderboard);
                return savedClassLeaderboard;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, classLeaderboard.getId().toString())
        );
    }

    /**
     * {@code GET  /class-leaderboards} : get all the classLeaderboards.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of classLeaderboards in body.
     */
    @GetMapping("")
    public List<ClassLeaderboard> getAllClassLeaderboards() {
        LOG.debug("REST request to get all ClassLeaderboards");
        return classLeaderboardRepository.findAll();
    }

    /**
     * {@code GET  /class-leaderboards/:id} : get the "id" classLeaderboard.
     *
     * @param id the id of the classLeaderboard to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the classLeaderboard, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClassLeaderboard> getClassLeaderboard(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ClassLeaderboard : {}", id);
        Optional<ClassLeaderboard> classLeaderboard = classLeaderboardRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(classLeaderboard);
    }

    /**
     * {@code DELETE  /class-leaderboards/:id} : delete the "id" classLeaderboard.
     *
     * @param id the id of the classLeaderboard to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClassLeaderboard(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ClassLeaderboard : {}", id);
        classLeaderboardRepository.deleteById(id);
        classLeaderboardSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /class-leaderboards/_search?query=:query} : search for the classLeaderboard corresponding
     * to the query.
     *
     * @param query the query of the classLeaderboard search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<ClassLeaderboard> searchClassLeaderboards(@RequestParam("query") String query) {
        LOG.debug("REST request to search ClassLeaderboards for query {}", query);
        try {
            return StreamSupport.stream(classLeaderboardSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}
