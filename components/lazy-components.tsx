"use client"

import { lazy, Suspense } from "react"
import { ProjectListSkeleton, FileUploadSkeleton } from "./loading-skeleton"

export const LazyProjectList = lazy(() => import("./project-list").then((module) => ({ default: module.ProjectList })))

export const LazyFileUploadZone = lazy(() =>
  import("./file-upload-zone").then((module) => ({ default: module.FileUploadZone })),
)

// Wrapper components with suspense
export function ProjectListWithSuspense() {
  return (
    <Suspense fallback={<ProjectListSkeleton />}>
      <LazyProjectList />
    </Suspense>
  )
}

export function FileUploadZoneWithSuspense({ onFileUpload }: { onFileUpload: (file: File) => void }) {
  return (
    <Suspense fallback={<FileUploadSkeleton />}>
      <LazyFileUploadZone onFileUpload={onFileUpload} />
    </Suspense>
  )
}
