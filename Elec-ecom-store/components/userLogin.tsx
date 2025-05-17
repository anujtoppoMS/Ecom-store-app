// "use client";

// import { useState } from "react";
// import { useLogin } from "@/app/api/auth/[...nextauth]/route";

// export default function LoginComponent() {
//   const { login, loading, error } = useLogin();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = () => {
//     login(email, password);
//   };

//   return (
//     <div>
//       <input
//         type="email"
//         placeholder="Email"
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button onClick={handleLogin} disabled={loading}>Login</button>

//       {error && <p>{error}</p>}
//     </div>
//   );
// }