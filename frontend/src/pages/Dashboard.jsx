import Button from "../components/Button";
function Dashboard() {
  return (
    <div style={styles.container}>
      <h2>Dashboard 🚗</h2>

      <div style={styles.card}>
        <p><b>Name:</b> Tanisha</p>
        <p><b>Token ID:</b> SPH12345</p>
        <p><b>Vehicle No:</b> UP14 AB 1234</p>
        <p><b>Status:</b> Parked ✅</p>
      </div>

      <Button
  text="Logout"
  color="red"
  onClick={() => navigate("/")}
/>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    marginBottom: "60px"
  },
  card: {
    background: "white",
    padding: "20px",
    margin: "20px auto",
    width: "300px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Dashboard;