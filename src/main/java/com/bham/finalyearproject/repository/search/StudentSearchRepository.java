package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.Student;
import com.bham.finalyearproject.repository.StudentRepository;
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
 * Spring Data Elasticsearch repository for the {@link Student} entity.
 */
public interface StudentSearchRepository extends ElasticsearchRepository<Student, Long>, StudentSearchRepositoryInternal {}

interface StudentSearchRepositoryInternal {
    Page<Student> search(String query, Pageable pageable);

    Page<Student> search(Query query);

    @Async
    void index(Student entity);

    @Async
    void deleteFromIndexById(Long id);
}

class StudentSearchRepositoryInternalImpl implements StudentSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final StudentRepository repository;

    StudentSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, StudentRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Page<Student> search(String query, Pageable pageable) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery.setPageable(pageable));
    }

    @Override
    public Page<Student> search(Query query) {
        SearchHits<Student> searchHits = elasticsearchTemplate.search(query, Student.class);
        List<Student> hits = searchHits.map(SearchHit::getContent).stream().toList();
        return new PageImpl<>(hits, query.getPageable(), searchHits.getTotalHits());
    }

    @Override
    public void index(Student entity) {
        repository.findOneWithEagerRelationships(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), Student.class);
    }
}
