function Button({ text, onClick, color = "blue" }) {
  const baseStyle = "w-full text-white p-2 rounded-md transition";

  const colorStyles = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    red: "bg-red-500 hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${colorStyles[color]}`}
    >
      {text}
    </button>
  );
}

export default Button;