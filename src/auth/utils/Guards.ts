//allows us to protect end points.if user isnt authenticated will receive a 401 or 403
//we invoke passport using guards 
//can activate :method to determine if a method is allowed to proceed .is a part of acn actiavte interface 
//the guards protect the routes and ensure the user is authenticated before allowing the request to proceed

import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
//takes care of requests passed 
export class GoogleAuthGuard extends AuthGuard('google'){
    async canActivate(context:ExecutionContext){
const activate = await super.canActivate(context) as boolean ; //asynchronous method call so add await. invokes passport google authentication strategy.if call is sucessful the user is authenticated.
const request =context.switchToHttp().getRequest();
await super.logIn(request);//calss passport login to establish login session 
return activate; 
    }

    
}
