package com.bham.finalyearproject.domain;

import static org.assertj.core.api.Assertions.assertThat;

public class StudentAsserts {

    /**
     * Asserts that the entity has all properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertStudentAllPropertiesEquals(Student expected, Student actual) {
        assertStudentAutoGeneratedPropertiesEquals(expected, actual);
        assertStudentAllUpdatablePropertiesEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all updatable properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertStudentAllUpdatablePropertiesEquals(Student expected, Student actual) {
        assertStudentUpdatableFieldsEquals(expected, actual);
        assertStudentUpdatableRelationshipsEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all the auto generated properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertStudentAutoGeneratedPropertiesEquals(Student expected, Student actual) {
        assertThat(expected)
            .as("Verify Student auto generated properties")
            .satisfies(e -> assertThat(e.getId()).as("check id").isEqualTo(actual.getId()));
    }

    /**
     * Asserts that the entity has all the updatable fields set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertStudentUpdatableFieldsEquals(Student expected, Student actual) {
        assertThat(expected)
            .as("Verify Student relevant properties")
            .satisfies(e -> assertThat(e.getName()).as("check name").isEqualTo(actual.getName()))
            .satisfies(e -> assertThat(e.getEmail()).as("check email").isEqualTo(actual.getEmail()))
            .satisfies(e -> assertThat(e.getPoints()).as("check points").isEqualTo(actual.getPoints()));
    }

    /**
     * Asserts that the entity has all the updatable relationships set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertStudentUpdatableRelationshipsEquals(Student expected, Student actual) {
        assertThat(expected)
            .as("Verify Student relationships")
            .satisfies(e -> assertThat(e.getQuestions()).as("check questions").isEqualTo(actual.getQuestions()))
            .satisfies(e -> assertThat(e.getClasses()).as("check classes").isEqualTo(actual.getClasses()));
    }
}