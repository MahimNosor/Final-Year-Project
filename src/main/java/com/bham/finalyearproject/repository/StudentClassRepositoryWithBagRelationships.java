package com.bham.finalyearproject.repository;

import com.bham.finalyearproject.domain.StudentClass;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface StudentClassRepositoryWithBagRelationships {
    Optional<StudentClass> fetchBagRelationships(Optional<StudentClass> studentClass);

    List<StudentClass> fetchBagRelationships(List<StudentClass> studentClasses);

    Page<StudentClass> fetchBagRelationships(Page<StudentClass> studentClasses);
}
