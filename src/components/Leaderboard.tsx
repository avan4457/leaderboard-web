import React, { useState } from "react";
import axios from "axios";
import { User } from "../utils/types";
import { StatType } from "../utils/enums";
import {
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useFetchUsers from "../hooks/UseFetchUsers";

// UserRow component
const UserRow: React.FC<{
  user: User;
  editedStats: { [key: number]: User["stats"] };
  handleStatChange: (userId: number, statType: StatType, value: number) => void;
  handleBlur: (userId: number, statType: StatType) => void;
}> = ({ user, editedStats, handleStatChange, handleBlur }) => (
  <TableRow key={user.id}>
    <TableCell
      component="th"
      scope="row"
      style={{ display: "flex", gap: 10, alignItems: "center" }}
    >
      <Avatar /> {user.username}
    </TableCell>
    <TableCell>
      <TextField
        type="number"
        value={
          editedStats[user.id]?.[StatType.KILL_COUNT] ??
          user.stats[StatType.KILL_COUNT]
        }
        onChange={(e) =>
          handleStatChange(
            user.id,
            StatType.KILL_COUNT,
            parseInt(e.target.value, 10)
          )
        }
        onBlur={() => handleBlur(user.id, StatType.KILL_COUNT)}
      />
    </TableCell>
    <TableCell>
      <TextField
        type="number"
        value={
          editedStats[user.id]?.[StatType.DEATH_COUNT] ??
          user.stats[StatType.DEATH_COUNT]
        }
        onChange={(e) =>
          handleStatChange(
            user.id,
            StatType.DEATH_COUNT,
            parseInt(e.target.value, 10)
          )
        }
        onBlur={() => handleBlur(user.id, StatType.DEATH_COUNT)}
      />
    </TableCell>
    <TableCell align="center">
      {user.stats[StatType.KILL_COUNT] - user.stats[StatType.DEATH_COUNT]}
    </TableCell>
  </TableRow>
);

const Leaderboard: React.FC = () => {
  const { users, topUsers, fetchAllUsers, fetchTopUsers } = useFetchUsers();
  const [editedStats, setEditedStats] = useState<{
    [key: number]: User["stats"];
  }>({});

  // Handle stat change and save it to state
  const handleStatChange = (
    userId: number,
    statType: StatType,
    value: number
  ) => {
    setEditedStats((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [statType]: value,
      },
    }));
  };

  // Handle stat update on blur event
  const handleBlur = async (userId: number, statType: StatType) => {
    const updatedStat = editedStats[userId]?.[statType];
    if (updatedStat !== undefined) {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/users/${userId}`,
          {
            stat: statType,
            value: updatedStat,
          }
        );
        await fetchAllUsers();
        await fetchTopUsers();
      } catch (error) {
        console.error("Error updating stats", error);
      }
    }
  };

  // Chart data for top 3 users
  const chartData = {
    labels: topUsers.map((user, index) => `${index + 1} ${user.username}`),
    datasets: [
      {
        label: "Points",
        data: topUsers.map(
          (user) =>
            user.stats[StatType.KILL_COUNT] - user.stats[StatType.DEATH_COUNT]
        ),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
      },
    ],
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  return (
    <div className="main-container">
      <div className="section">
        <h2>Top 30 Users</h2>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center">Kill count</TableCell>
                <TableCell align="center">Death count</TableCell>
                <TableCell>Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  editedStats={editedStats}
                  handleStatChange={handleStatChange}
                  handleBlur={handleBlur}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="section">
        <h2>Top 3 Users</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default Leaderboard;
