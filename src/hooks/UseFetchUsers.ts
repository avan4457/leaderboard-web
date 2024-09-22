import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { User } from "../utils/types";

const useFetchUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users`
      );
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching all users", error);
    }
  }, []);

  const fetchTopUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users?top=3`
      );
      setTopUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching top users", error);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
    fetchTopUsers();
  }, [fetchAllUsers, fetchTopUsers]);

  return { users, topUsers, fetchAllUsers, fetchTopUsers };
};

export default useFetchUsers;
