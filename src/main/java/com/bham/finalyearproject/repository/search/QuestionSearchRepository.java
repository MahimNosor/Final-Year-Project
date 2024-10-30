package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.Question;
import com.bham.finalyearproject.repository.QuestionRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;

/**
 * Spring Data Elasticsearch repository for the {@link Question} entity.
 */
public interface QuestionSearchRepository extends ElasticsearchRepository<Question, Long>, QuestionSearchRepositoryInternal {}

interface QuestionSearchRepositoryInternal {
    Page<Question> search(String query, Pageable pageable);

    Page<Question> search(Query query);

    @Async
    void index(Question entity);

    @Async
    void deleteFromIndexById(Long id);
}

class QuestionSearchRepositoryInternalImpl implements QuestionSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final QuestionRepository repository;

    QuestionSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, QuestionRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Page<Question> search(String query, Pageable pageable) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery.setPageable(pageable));
    }

    @Override
    public Page<Question> search(Query query) {
        SearchHits<Question> searchHits = elasticsearchTemplate.search(query, Question.class);
        List<Question> hits = searchHits.map(SearchHit::getContent).stream().toList();
        return new PageImpl<>(hits, query.getPageable(), searchHits.getTotalHits());
    }

    @Override
    public void index(Question entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), Question.class);
    }
}
