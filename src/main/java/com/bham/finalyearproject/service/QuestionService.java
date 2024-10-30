package com.bham.finalyearproject.service;

import com.bham.finalyearproject.domain.Question;
import com.bham.finalyearproject.repository.QuestionRepository;
import com.bham.finalyearproject.repository.search.QuestionSearchRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.bham.finalyearproject.domain.Question}.
 */
@Service
@Transactional
public class QuestionService {

    private static final Logger LOG = LoggerFactory.getLogger(QuestionService.class);

    private final QuestionRepository questionRepository;

    private final QuestionSearchRepository questionSearchRepository;

    public QuestionService(QuestionRepository questionRepository, QuestionSearchRepository questionSearchRepository) {
        this.questionRepository = questionRepository;
        this.questionSearchRepository = questionSearchRepository;
    }

    /**
     * Save a question.
     *
     * @param question the entity to save.
     * @return the persisted entity.
     */
    public Question save(Question question) {
        LOG.debug("Request to save Question : {}", question);
        question = questionRepository.save(question);
        questionSearchRepository.index(question);
        return question;
    }

    /**
     * Update a question.
     *
     * @param question the entity to save.
     * @return the persisted entity.
     */
    public Question update(Question question) {
        LOG.debug("Request to update Question : {}", question);
        question = questionRepository.save(question);
        questionSearchRepository.index(question);
        return question;
    }

    /**
     * Partially update a question.
     *
     * @param question the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Question> partialUpdate(Question question) {
        LOG.debug("Request to partially update Question : {}", question);

        return questionRepository
            .findById(question.getId())
            .map(existingQuestion -> {
                if (question.getTitle() != null) {
                    existingQuestion.setTitle(question.getTitle());
                }
                if (question.getDifficulty() != null) {
                    existingQuestion.setDifficulty(question.getDifficulty());
                }
                if (question.getDescription() != null) {
                    existingQuestion.setDescription(question.getDescription());
                }
                if (question.getSolution() != null) {
                    existingQuestion.setSolution(question.getSolution());
                }
                if (question.getLanguage() != null) {
                    existingQuestion.setLanguage(question.getLanguage());
                }
                if (question.getPreLoaded() != null) {
                    existingQuestion.setPreLoaded(question.getPreLoaded());
                }

                return existingQuestion;
            })
            .map(questionRepository::save)
            .map(savedQuestion -> {
                questionSearchRepository.index(savedQuestion);
                return savedQuestion;
            });
    }

    /**
     * Get all the questions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Question> findAll(Pageable pageable) {
        LOG.debug("Request to get all Questions");
        return questionRepository.findAll(pageable);
    }

    /**
     * Get one question by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Question> findOne(Long id) {
        LOG.debug("Request to get Question : {}", id);
        return questionRepository.findById(id);
    }

    /**
     * Delete the question by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Question : {}", id);
        questionRepository.deleteById(id);
        questionSearchRepository.deleteFromIndexById(id);
    }

    /**
     * Search for the question corresponding to the query.
     *
     * @param query the query of the search.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Question> search(String query, Pageable pageable) {
        LOG.debug("Request to search for a page of Questions for query {}", query);
        return questionSearchRepository.search(query, pageable);
    }
}
