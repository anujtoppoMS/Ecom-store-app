// "use client";

// import { useState } from "react";
// import { useRegister } from "@/app/api/register/route";

// export default function RegisterComponent() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { register, loading, message, error } = useRegister();

//   const handleRegister = () => {
//     register(email, password);
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
//       <button onClick={handleRegister} disabled={loading}>
//         {loading ? "Registering..." : "Register"}
//       </button>

//       {message && <p style={{ color: "green" }}>{message}</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }