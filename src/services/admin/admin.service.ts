import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs"
import { CreateUserDTO } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(data: CreateUserDTO){
        // same as src/services/user.service.ts
        const emailCheck = await userRepository.getUserByEmail(data.email);
            if (emailCheck) {
              throw new HttpError(403, "Email already in use");
            }
        
            // Check if phone already exists
            const phoneCheck = await userRepository.getUserByPhone(data.phoneNumber);
            if (phoneCheck) {
              throw new HttpError(403, "Phone number already in use");
            }
        
            // Hash password
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        
            // Create user
            const newUser = await userRepository.createUser({
              fullName: data.fullName,
              email: data.email,
              phoneNumber: data.phoneNumber,
              password: data.password,
              role: "user",
            });
        
            return newUser;
    }
    async getAllUsers(){
        const users = await userRepository.getAllUsers();
        // transformation or filtering logic can be added here
        return users;
    }
    async getOneUser(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }
    // continue all
}