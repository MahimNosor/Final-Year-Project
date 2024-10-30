package com.bham.finalyearproject.web.rest;

import com.bham.finalyearproject.domain.GlobalLeaderboard;
import com.bham.finalyearproject.repository.GlobalLeaderboardRepository;
import com.bham.finalyearproject.repository.search.GlobalLeaderboardSearchRepository;
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
 * REST controller for managing {@link com.bham.finalyearproject.domain.GlobalLeaderboard}.
 */
@RestController
@RequestMapping("/api/global-leaderboards")
@Transactional
public class GlobalLeaderboardResource {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalLeaderboardResource.class);

    private static final String ENTITY_NAME = "globalLeaderboard";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GlobalLeaderboardRepository globalLeaderboardRepository;

    private final GlobalLeaderboardSearchRepository globalLeaderboardSearchRepository;

    public GlobalLeaderboardResource(
        GlobalLeaderboardRepository globalLeaderboardRepository,
        GlobalLeaderboardSearchRepository globalLeaderboardSearchRepository
    ) {
        this.globalLeaderboardRepository = globalLeaderboardRepository;
        this.globalLeaderboardSearchRepository = globalLeaderboardSearchRepository;
    }

    /**
     * {@code POST  /global-leaderboards} : Create a new globalLeaderboard.
     *
     * @param globalLeaderboard the globalLeaderboard to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new globalLeaderboard, or with status {@code 400 (Bad Request)} if the globalLeaderboard has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<GlobalLeaderboard> createGlobalLeaderboard(@Valid @RequestBody GlobalLeaderboard globalLeaderboard)
        throws URISyntaxException {
        LOG.debug("REST request to save GlobalLeaderboard : {}", globalLeaderboard);
        if (globalLeaderboard.getId() != null) {
            throw new BadRequestAlertException("A new globalLeaderboard cannot already have an ID", ENTITY_NAME, "idexists");
        }
        globalLeaderboard = globalLeaderboardRepository.save(globalLeaderboard);
        globalLeaderboardSearchRepository.index(globalLeaderboard);
        return ResponseEntity.created(new URI("/api/global-leaderboards/" + globalLeaderboard.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, globalLeaderboard.getId().toString()))
            .body(globalLeaderboard);
    }

    /**
     * {@code PUT  /global-leaderboards/:id} : Updates an existing globalLeaderboard.
     *
     * @param id the id of the globalLeaderboard to save.
     * @param globalLeaderboard the globalLeaderboard to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated globalLeaderboard,
     * or with status {@code 400 (Bad Request)} if the globalLeaderboard is not valid,
     * or with status {@code 500 (Internal Server Error)} if the globalLeaderboard couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<GlobalLeaderboard> updateGlobalLeaderboard(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody GlobalLeaderboard globalLeaderboard
    ) throws URISyntaxException {
        LOG.debug("REST request to update GlobalLeaderboard : {}, {}", id, globalLeaderboard);
        if (globalLeaderboard.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, globalLeaderboard.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!globalLeaderboardRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        globalLeaderboard = globalLeaderboardRepository.save(globalLeaderboard);
        globalLeaderboardSearchRepository.index(globalLeaderboard);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, globalLeaderboard.getId().toString()))
            .body(globalLeaderboard);
    }

    /**
     * {@code PATCH  /global-leaderboards/:id} : Partial updates given fields of an existing globalLeaderboard, field will ignore if it is null
     *
     * @param id the id of the globalLeaderboard to save.
     * @param globalLeaderboard the globalLeaderboard to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated globalLeaderboard,
     * or with status {@code 400 (Bad Request)} if the globalLeaderboard is not valid,
     * or with status {@code 404 (Not Found)} if the globalLeaderboard is not found,
     * or with status {@code 500 (Internal Server Error)} if the globalLeaderboard couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<GlobalLeaderboard> partialUpdateGlobalLeaderboard(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody GlobalLeaderboard globalLeaderboard
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update GlobalLeaderboard partially : {}, {}", id, globalLeaderboard);
        if (globalLeaderboard.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, globalLeaderboard.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!globalLeaderboardRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<GlobalLeaderboard> result = globalLeaderboardRepository
            .findById(globalLeaderboard.getId())
            .map(existingGlobalLeaderboard -> {
                if (globalLeaderboard.getRank() != null) {
                    existingGlobalLeaderboard.setRank(globalLeaderboard.getRank());
                }
                if (globalLeaderboard.getTotalPoints() != null) {
                    existingGlobalLeaderboard.setTotalPoints(globalLeaderboard.getTotalPoints());
                }

                return existingGlobalLeaderboard;
            })
            .map(globalLeaderboardRepository::save)
            .map(savedGlobalLeaderboard -> {
                globalLeaderboardSearchRepository.index(savedGlobalLeaderboard);
                return savedGlobalLeaderboard;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, globalLeaderboard.getId().toString())
        );
    }

    /**
     * {@code GET  /global-leaderboards} : get all the globalLeaderboards.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of globalLeaderboards in body.
     */
    @GetMapping("")
    public List<GlobalLeaderboard> getAllGlobalLeaderboards() {
        LOG.debug("REST request to get all GlobalLeaderboards");
        return globalLeaderboardRepository.findAll();
    }

    /**
     * {@code GET  /global-leaderboards/:id} : get the "id" globalLeaderboard.
     *
     * @param id the id of the globalLeaderboard to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the globalLeaderboard, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GlobalLeaderboard> getGlobalLeaderboard(@PathVariable("id") Long id) {
        LOG.debug("REST request to get GlobalLeaderboard : {}", id);
        Optional<GlobalLeaderboard> globalLeaderboard = globalLeaderboardRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(globalLeaderboard);
    }

    /**
     * {@code DELETE  /global-leaderboards/:id} : delete the "id" globalLeaderboard.
     *
     * @param id the id of the globalLeaderboard to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGlobalLeaderboard(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete GlobalLeaderboard : {}", id);
        globalLeaderboardRepository.deleteById(id);
        globalLeaderboardSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /global-leaderboards/_search?query=:query} : search for the globalLeaderboard corresponding
     * to the query.
     *
     * @param query the query of the globalLeaderboard search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<GlobalLeaderboard> searchGlobalLeaderboards(@RequestParam("query") String query) {
        LOG.debug("REST request to search GlobalLeaderboards for query {}", query);
        try {
            return StreamSupport.stream(globalLeaderboardSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}
