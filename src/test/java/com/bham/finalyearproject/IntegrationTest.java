package com.bham.finalyearproject;

import com.bham.finalyearproject.config.AsyncSyncConfiguration;
import com.bham.finalyearproject.config.EmbeddedElasticsearch;
import com.bham.finalyearproject.config.EmbeddedSQL;
import com.bham.finalyearproject.config.JacksonConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(classes = { FinalYearProjectApp.class, JacksonConfiguration.class, AsyncSyncConfiguration.class })
@EmbeddedElasticsearch
@EmbeddedSQL
public @interface IntegrationTest {
}
