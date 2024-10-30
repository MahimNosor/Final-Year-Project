package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.StudentClass;
import com.bham.finalyearproject.repository.StudentClassRepository;
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
 * Spring Data Elasticsearch repository for the {@link StudentClass} entity.
 */
public interface StudentClassSearchRepository extends ElasticsearchRepository<StudentClass, Long>, StudentClassSearchRepositoryInternal {}

interface StudentClassSearchRepositoryInternal {
    Page<StudentClass> search(String query, Pageable pageable);

    Page<StudentClass> search(Query query);

    @Async
    void index(StudentClass entity);

    @Async
    void deleteFromIndexById(Long id);
}

class StudentClassSearchRepositoryInternalImpl implements StudentClassSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final StudentClassRepository repository;

    StudentClassSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, StudentClassRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Page<StudentClass> search(String query, Pageable pageable) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery.setPageable(pageable));
    }

    @Override
    public Page<StudentClass> search(Query query) {
        SearchHits<StudentClass> searchHits = elasticsearchTemplate.search(query, StudentClass.class);
        List<StudentClass> hits = searchHits.map(SearchHit::getContent).stream().toList();
        return new PageImpl<>(hits, query.getPageable(), searchHits.getTotalHits());
    }

    @Override
    public void index(StudentClass entity) {
        repository.findOneWithEagerRelationships(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), StudentClass.class);
    }
}
