import React, { useState, useEffect } from "react";
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

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [editedStats, setEditedStats] = useState<{
    [key: number]: User["stats"];
  }>({});

  const fetchAllUsers = () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/users`)
      .then((response) => {
        setUsers(response.data.data);
      })
      .catch((error) => console.error(error));
  };

  const fetchTopUsers = () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/users?top=3`)
      .then((response) => {
        setTopUsers(response.data.data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchAllUsers();
    fetchTopUsers();
  }, []);

  // Handle stat change and save it to state on blur
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

  // Handle stat update on blur event (when the user unselects the input)
  const handleBlur = (userId: number, statType: StatType) => {
    const updatedStat = editedStats[userId]?.[statType];

    // Only update if there is a new value
    if (updatedStat !== undefined) {
      axios
        .put(`${process.env.REACT_APP_API_BASE_URL}/users/${userId}`, {
          stat: statType,
          value: updatedStat,
        })
        .then((response) => {
          console.log(response.data);
          fetchAllUsers();
          fetchTopUsers();
        })
        .catch((error) => console.error(error));
    }
  };

  // Chart data for top 3 users
  const chartData = {
    labels: topUsers.map((user) => user.username),
    datasets: [
      {
        label: "pts",
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
                <TableCell>Username</TableCell>
                <TableCell align="center">Kill count</TableCell>
                <TableCell align="center">Death count</TableCell>
                <TableCell align="center">pts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
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
                  <TableCell>
                    {user.stats[StatType.KILL_COUNT] -
                      user.stats[StatType.DEATH_COUNT]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="section">
        <h2>Top 3 Users Chart</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default Leaderboard;
