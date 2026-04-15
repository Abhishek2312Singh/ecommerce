function Footer() {
  return (
    <div style={styles.footer}>
      <p>© 2026 SmartParkHub | All Rights Reserved</p>
    </div>
  );
}

const styles = {
  footer: {
    backgroundColor: "#111827",
    color: "white",
    padding: "10px",
    textAlign: "center",
    bottom: 0,
    width: "100%"
  }
};

export default Footer;