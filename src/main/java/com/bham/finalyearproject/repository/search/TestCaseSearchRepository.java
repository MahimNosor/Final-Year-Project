package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.TestCase;
import com.bham.finalyearproject.repository.TestCaseRepository;
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
 * Spring Data Elasticsearch repository for the {@link TestCase} entity.
 */
public interface TestCaseSearchRepository extends ElasticsearchRepository<TestCase, Long>, TestCaseSearchRepositoryInternal {}

interface TestCaseSearchRepositoryInternal {
    Page<TestCase> search(String query, Pageable pageable);

    Page<TestCase> search(Query query);

    @Async
    void index(TestCase entity);

    @Async
    void deleteFromIndexById(Long id);
}

class TestCaseSearchRepositoryInternalImpl implements TestCaseSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final TestCaseRepository repository;

    TestCaseSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, TestCaseRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Page<TestCase> search(String query, Pageable pageable) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery.setPageable(pageable));
    }

    @Override
    public Page<TestCase> search(Query query) {
        SearchHits<TestCase> searchHits = elasticsearchTemplate.search(query, TestCase.class);
        List<TestCase> hits = searchHits.map(SearchHit::getContent).stream().toList();
        return new PageImpl<>(hits, query.getPageable(), searchHits.getTotalHits());
    }

    @Override
    public void index(TestCase entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), TestCase.class);
    }
}
