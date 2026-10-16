import { NombreRol } from '../../roles/entities/role.entity';

export interface AuthUser {
  id: number;
  email: string;
  roles: NombreRol[];
}
