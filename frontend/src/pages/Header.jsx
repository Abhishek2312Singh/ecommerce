function Header() {
  return (
    <div style={styles.header}>
      <h1>SmartParkHub 🚗</h1>
      <p>Smart Parking Allotment System</p>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: "#111827",
    color: "white",
    padding: "15px",
    textAlign: "center"
  }
};

export default Header;