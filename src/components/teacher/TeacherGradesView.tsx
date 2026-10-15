import React from 'react'
import { GradeEntryView } from '../GradeEntryView'
import { MY_CLASSES, INITIAL_STUDENTS_GRADES } from '../../mockData'
import type { ClassItem, StudentGrade } from '../../types'

interface TeacherGradesViewProps {
  classes?: ClassItem[]
  gradesData?: Record<string, StudentGrade[]>
  onSaveGrades: (classCode: string, grades: StudentGrade[]) => void
}

export const TeacherGradesView: React.FC<TeacherGradesViewProps> = ({
  classes = MY_CLASSES,
  gradesData = INITIAL_STUDENTS_GRADES,
  onSaveGrades
}) => {
  return (
    <GradeEntryView
      classes={classes}
      gradesData={gradesData}
      onSaveGrades={onSaveGrades}
    />
  )
}
