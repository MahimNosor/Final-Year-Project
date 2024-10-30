package com.bham.finalyearproject.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.bham.finalyearproject.domain.GlobalLeaderboard;
import com.bham.finalyearproject.repository.GlobalLeaderboardRepository;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;

/**
 * Spring Data Elasticsearch repository for the {@link GlobalLeaderboard} entity.
 */
public interface GlobalLeaderboardSearchRepository
    extends ElasticsearchRepository<GlobalLeaderboard, Long>, GlobalLeaderboardSearchRepositoryInternal {}

interface GlobalLeaderboardSearchRepositoryInternal {
    Stream<GlobalLeaderboard> search(String query);

    Stream<GlobalLeaderboard> search(Query query);

    @Async
    void index(GlobalLeaderboard entity);

    @Async
    void deleteFromIndexById(Long id);
}

class GlobalLeaderboardSearchRepositoryInternalImpl implements GlobalLeaderboardSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final GlobalLeaderboardRepository repository;

    GlobalLeaderboardSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, GlobalLeaderboardRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<GlobalLeaderboard> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<GlobalLeaderboard> search(Query query) {
        return elasticsearchTemplate.search(query, GlobalLeaderboard.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(GlobalLeaderboard entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), GlobalLeaderboard.class);
    }
}
