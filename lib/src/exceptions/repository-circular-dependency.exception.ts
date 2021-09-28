export class RepositoryCircularDependencyException extends Error {
  constructor(property: string) {
    super(
      `Circular dependency is detected in repository in expand property "${property}". Please use "forwardRef()" from "nestjs/common" package to avoid it.`,
    );
  }
}
