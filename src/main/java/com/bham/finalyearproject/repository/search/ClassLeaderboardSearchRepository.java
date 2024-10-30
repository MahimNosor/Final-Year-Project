package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.ClassLeaderboard;
import com.bham.finalyearproject.repository.ClassLeaderboardRepository;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;

/**
 * Spring Data Elasticsearch repository for the {@link ClassLeaderboard} entity.
 */
public interface ClassLeaderboardSearchRepository
    extends ElasticsearchRepository<ClassLeaderboard, Long>, ClassLeaderboardSearchRepositoryInternal {}

interface ClassLeaderboardSearchRepositoryInternal {
    Stream<ClassLeaderboard> search(String query);

    Stream<ClassLeaderboard> search(Query query);

    @Async
    void index(ClassLeaderboard entity);

    @Async
    void deleteFromIndexById(Long id);
}

class ClassLeaderboardSearchRepositoryInternalImpl implements ClassLeaderboardSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final ClassLeaderboardRepository repository;

    ClassLeaderboardSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, ClassLeaderboardRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<ClassLeaderboard> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<ClassLeaderboard> search(Query query) {
        return elasticsearchTemplate.search(query, ClassLeaderboard.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(ClassLeaderboard entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), ClassLeaderboard.class);
    }
}
