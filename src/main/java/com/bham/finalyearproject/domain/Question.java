package com.bham.finalyearproject.domain;

import com.bham.finalyearproject.domain.enumeration.ProgrammingLanguage;
import com.bham.finalyearproject.domain.enumeration.QuestionDifficulty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Question.
 */
@Entity
@Table(name = "question")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@org.springframework.data.elasticsearch.annotations.Document(indexName = "question")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Question implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "title", nullable = false)
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String title;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false)
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Keyword)
    private QuestionDifficulty difficulty;

    @Lob
    @Column(name = "description", nullable = false)
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String description;

    @Lob
    @Column(name = "solution")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String solution;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "language", nullable = false)
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Keyword)
    private ProgrammingLanguage language;

    @NotNull
    @Column(name = "pre_loaded", nullable = false)
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Boolean)
    private Boolean preLoaded;

    @ManyToOne(fetch = FetchType.LAZY)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "teacher", "students" }, allowSetters = true)
    private StudentClass studentClass;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "questions")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @org.springframework.data.annotation.Transient
    @JsonIgnoreProperties(value = { "questions", "classes" }, allowSetters = true)
    private Set<Student> students = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Question id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Question title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public QuestionDifficulty getDifficulty() {
        return this.difficulty;
    }

    public Question difficulty(QuestionDifficulty difficulty) {
        this.setDifficulty(difficulty);
        return this;
    }

    public void setDifficulty(QuestionDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getDescription() {
        return this.description;
    }

    public Question description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSolution() {
        return this.solution;
    }

    public Question solution(String solution) {
        this.setSolution(solution);
        return this;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public ProgrammingLanguage getLanguage() {
        return this.language;
    }

    public Question language(ProgrammingLanguage language) {
        this.setLanguage(language);
        return this;
    }

    public void setLanguage(ProgrammingLanguage language) {
        this.language = language;
    }

    public Boolean getPreLoaded() {
        return this.preLoaded;
    }

    public Question preLoaded(Boolean preLoaded) {
        this.setPreLoaded(preLoaded);
        return this;
    }

    public void setPreLoaded(Boolean preLoaded) {
        this.preLoaded = preLoaded;
    }

    public Teacher getTeacher() {
        return this.teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Question teacher(Teacher teacher) {
        this.setTeacher(teacher);
        return this;
    }

    public StudentClass getStudentClass() {
        return this.studentClass;
    }

    public void setStudentClass(StudentClass studentClass) {
        this.studentClass = studentClass;
    }

    public Question studentClass(StudentClass studentClass) {
        this.setStudentClass(studentClass);
        return this;
    }

    public Set<Student> getStudents() {
        return this.students;
    }

    public void setStudents(Set<Student> students) {
        if (this.students != null) {
            this.students.forEach(i -> i.removeQuestions(this));
        }
        if (students != null) {
            students.forEach(i -> i.addQuestions(this));
        }
        this.students = students;
    }

    public Question students(Set<Student> students) {
        this.setStudents(students);
        return this;
    }

    public Question addStudents(Student student) {
        this.students.add(student);
        student.getQuestions().add(this);
        return this;
    }

    public Question removeStudents(Student student) {
        this.students.remove(student);
        student.getQuestions().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Question)) {
            return false;
        }
        return getId() != null && getId().equals(((Question) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Question{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", difficulty='" + getDifficulty() + "'" +
            ", description='" + getDescription() + "'" +
            ", solution='" + getSolution() + "'" +
            ", language='" + getLanguage() + "'" +
            ", preLoaded='" + getPreLoaded() + "'" +
            "}";
    }
}
