import { CanActivate, ExecutionContext, Injectable, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si la ruta no especifica roles, la dejamos pasar.
    }

    const request = context.switchToHttp().getRequest();
    const role = request.headers['x-user-role'];
    const userId = request.headers['x-user-id'];

    if (!role || !userId) {
      throw new ForbiddenException('Debe proveer headers x-user-role y x-user-id para la simulación');
    }

    // Guardar el "usuario actual" en el request para uso posterior
    request.user = { id: parseInt(userId, 10), role };

    if (!requiredRoles.includes(role.toUpperCase())) {
      throw new ForbiddenException(`Acceso denegado. Se requiere uno de los roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
