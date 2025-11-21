import { FONT_FAMILY, type TeamData } from "@/App";

const InputScreen: React.FC<{
  data: TeamData[];
  onChange: (index: number, value: string) => void;
  onFinish: () => void;
}> = ({ data, onChange, onFinish }) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#111",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <h1 style={{ marginBottom: "40px", fontSize: "24px" }}>
        TEAM SCORE SETTINGS
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "300px",
        }}
      >
        {data.map((team, index) => (
          <div
            key={team.id}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              {team.label}
            </div>
            <input
              type="number"
              value={team.score}
              onChange={(e) => onChange(index, e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "18px",
                backgroundColor: "#222",
                border: "1px solid #555",
                color: "white",
                borderRadius: "4px",
              }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onFinish}
        style={{
          marginTop: "40px",
          padding: "15px 50px",
          fontSize: "18px",
          fontWeight: "bold",
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
        }}
      >
        SHOW GRAPH
      </button>
    </div>
  );
};
export default InputScreen;
