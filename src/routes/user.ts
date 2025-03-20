import { registerUser, getUser, loginUser, checkToken } from "../controllers/userController";

const userRoutes = (app) => {
    app.route("/user")

    app.route("/user/:id")
        .get((req, res, next) => {
            console.log(`Request from: ${req.originalUrl}`);
            console.log(`Request type: ${req.method}`);
            next();
        }, getUser)
        .put((req, res, next) => {
            // PUT request
            res.status(200).send({
                message: "PUT request successful",
            });
        })
        .delete((req, res, next) => {
            // DELETE request
            res.status(200).send({
                message: "DELETE request successful",
            });
        });

    app.route("/check-token")
        .get(checkToken);
    
    app.route("/auth/register")
        .post(registerUser);

    app.route("/login")
        .post(loginUser);
}

export default userRoutes;