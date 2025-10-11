import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>() as any;
    const controllerName = context.getClass().name;

    // Skip wrapping for Auth endpoints to avoid breaking login shape
    const isAuth = controllerName === 'AuthController' || (req?.path && String(req.path).startsWith('/api/auth'));

    return next.handle().pipe(
      map((value) => {
        // Preserve NO_CONTENT (204) responses which typically return undefined/null
        if (value === undefined) return value;

        if (isAuth) return value;

        // If already in { data, meta?, error? } shape, keep it
        if (value && typeof value === 'object' && ('data' in value || 'error' in value)) {
          return value;
        }

        // Default wrap
        return { data: value };
      }),
    );
  }
}

