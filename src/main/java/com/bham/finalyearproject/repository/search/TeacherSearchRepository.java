package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.Teacher;
import com.bham.finalyearproject.repository.TeacherRepository;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;

/**
 * Spring Data Elasticsearch repository for the {@link Teacher} entity.
 */
public interface TeacherSearchRepository extends ElasticsearchRepository<Teacher, Long>, TeacherSearchRepositoryInternal {}

interface TeacherSearchRepositoryInternal {
    Stream<Teacher> search(String query);

    Stream<Teacher> search(Query query);

    @Async
    void index(Teacher entity);

    @Async
    void deleteFromIndexById(Long id);
}

class TeacherSearchRepositoryInternalImpl implements TeacherSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final TeacherRepository repository;

    TeacherSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, TeacherRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<Teacher> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<Teacher> search(Query query) {
        return elasticsearchTemplate.search(query, Teacher.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(Teacher entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), Teacher.class);
    }
}
