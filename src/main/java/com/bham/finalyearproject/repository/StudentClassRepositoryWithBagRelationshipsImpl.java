package com.bham.finalyearproject.repository;

import com.bham.finalyearproject.domain.StudentClass;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class StudentClassRepositoryWithBagRelationshipsImpl implements StudentClassRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String STUDENTCLASSES_PARAMETER = "studentClasses";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<StudentClass> fetchBagRelationships(Optional<StudentClass> studentClass) {
        return studentClass.map(this::fetchStudents);
    }

    @Override
    public Page<StudentClass> fetchBagRelationships(Page<StudentClass> studentClasses) {
        return new PageImpl<>(
            fetchBagRelationships(studentClasses.getContent()),
            studentClasses.getPageable(),
            studentClasses.getTotalElements()
        );
    }

    @Override
    public List<StudentClass> fetchBagRelationships(List<StudentClass> studentClasses) {
        return Optional.of(studentClasses).map(this::fetchStudents).orElse(Collections.emptyList());
    }

    StudentClass fetchStudents(StudentClass result) {
        return entityManager
            .createQuery(
                "select studentClass from StudentClass studentClass left join fetch studentClass.students where studentClass.id = :id",
                StudentClass.class
            )
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<StudentClass> fetchStudents(List<StudentClass> studentClasses) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, studentClasses.size()).forEach(index -> order.put(studentClasses.get(index).getId(), index));
        List<StudentClass> result = entityManager
            .createQuery(
                "select studentClass from StudentClass studentClass left join fetch studentClass.students where studentClass in :studentClasses",
                StudentClass.class
            )
            .setParameter(STUDENTCLASSES_PARAMETER, studentClasses)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
