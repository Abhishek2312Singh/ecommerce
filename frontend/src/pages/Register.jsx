import Button from "../components/Button";
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [license, setLicense] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [password, setPassword] = useState("");

  // Error state
  const [error, setError] = useState("");

  // Validation function
  const handleRegister = () => {
    if (!name || !role || !license || !vehicle || !password) {
      setError("All fields are required");
      return;
    }

    setError(""); // clear error

    // Later: send data to backend
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-80">

        <h2 className="text-2xl font-bold text-center mb-6">
          Register 🚗
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <Input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">Select Role</option>
          <option>Student</option>
          <option>Faculty</option>
          <option>Staff</option>
        </select>

        <Input
          placeholder="Driving License Number"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
        />

        <Input
          placeholder="Vehicle Number"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          text="Register"
          color="green"
          onClick={handleRegister}
        />

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;