import React from 'react'
import { ClassesView } from '../ClassesView'
import { MY_CLASSES } from '../../mockData'
import type { ClassItem } from '../../types'

interface TeacherClassesViewProps {
  classes?: ClassItem[]
  onOpenGradebook: (classCode: string) => void
}

export const TeacherClassesView: React.FC<TeacherClassesViewProps> = ({
  classes = MY_CLASSES,
  onOpenGradebook
}) => {
  return <ClassesView classes={classes} onOpenGradebook={onOpenGradebook} />
}
