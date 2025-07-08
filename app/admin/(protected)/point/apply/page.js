"use client";

import { muiDataGridKoreanText } from "@/data/MuiDataGridKo";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { formatToYMDHM } from "@/utils/supabase/formatDate";
import { CircularProgress, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const Apply = () => {
  const supabase = createBrowserSupabaseClient();
  const [applies, setApplies] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("point_charge_apply")
      .select(
        `
        *,
        profiles:profiles(display_name),
        teams:teams(name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setApplies(data);
    }
  };

  const handleCharge = async () => {
    if (selectedIds?.ids?.length === 0) return alert("선택된 항목이 없습니다.");

    const selectedApplies = applies.filter((apply) =>
      selectedIds.ids.has(apply.id)
    );

    try {
      await Promise.all(
        selectedApplies.map(async (apply) => {
          const { data: recentLog } = await supabase
            .from("point_logs")
            .select()
            .eq("team_id", apply.team_id)
            .order("created_at", { ascending: false })
            .range(0, 0);

          console.log(recentLog);
          const newGeneralPoint = recentLog[0]?.remaining_general
            ? parseInt(recentLog[0].remaining_general) + parseInt(apply.points)
            : apply.points;
          const newLog = {
            team_id: apply.team_id,
            amount: apply.points,
            remaining_season: recentLog[0]?.remaining_season ?? 0,
            remaining_general: newGeneralPoint,
            description: "포인트 충전",
            type: "충전",
          };

          const { error: logError } = await supabase
            .from("point_logs")
            .insert(newLog);
          if (logError) throw logError;

          const { error: pointError } = await supabase
            .from("points")
            .update({
              season_points: recentLog[0]?.remaining_season ?? 0,
              general_points: newGeneralPoint,
            })
            .eq("team_id", apply.team_id);
          if (pointError) throw pointError;

          const { error } = await supabase
            .from("point_charge_apply")
            .update({ is_charged: true })
            .in("id", selectedIds.ids);
          if (error) throw error;
        })
      );
      alert("선택된 항목을 충전 처리했습니다.");
      setSelectedIds([]);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("충전 처리에 실패했습니다.");
    }
    // const {error:logError} = await supabase
    //   .from("point_logs")
    //   .insert({team_id: })

    // const { error } = await supabase
    //   .from("point_charge_apply")
    //   .update({ is_charged: true })
    //   .in("id", selectedIds.ids);

    // if (error) {
    //   console.error("Update error:", error);
    //   alert("충전 처리에 실패했습니다.");
    // } else {
    //   alert("선택된 항목을 충전 처리했습니다.");
    //   fetchData();
    // }
  };
  const COLUMNS = [
    {
      flex: 1,
      field: "teamsName",
      headerName: "팀명",
      valueGetter: (value, row) => {
        return row?.teams?.name;
      },
      renderCell: ({ row }) => {
        const { teams } = row;
        return <p>{teams.name}</p>;
      },
    },
    {
      flex: 1,
      field: "profiles.display_name",
      headerName: "신청자 닉네임",
      valueGetter: (value, row) => {
        return row?.profiles?.display_name;
      },
      renderCell: ({ row }) => {
        const { profiles } = row;
        return <p>{profiles.display_name}</p>;
      },
    },
    {
      flex: 1,
      field: "points",
      headerName: "포인트",
      renderCell: ({ row }) => {
        const { points } = row;
        return <p>{points}p</p>;
      },
    },
    {
      flex: 1,
      field: "depositor",
      headerName: "입금자명",
      renderCell: ({ row }) => {
        const { depositor } = row;
        return <p>{depositor}</p>;
      },
    },
    {
      flex: 1,
      field: "created_at",
      headerName: "신청일",
      valueGetter: (value, row) => {
        return formatToYMDHM(row.created_at);
      },
      renderCell: ({ row }) => {
        const { created_at } = row;
        return <p>{formatToYMDHM(created_at)}</p>;
      },
    },
    {
      flex: 1,
      field: "is_charged",
      headerName: "충전 여부",
      valueGetter: (value, row) => {
        return row?.is_charged ? "충전됨" : "미충전";
      },
      renderCell: ({ row }) => {
        const { is_charged } = row;
        return (
          <p className={`${!is_charged ? "text-red-700" : "text-blue-700"}`}>
            {is_charged ? "충전됨" : "미충전"}
          </p>
        );
      },
    },
  ];

  if (!applies)
    return (
      <div className="flex justify-center mt-10">
        <CircularProgress />
      </div>
    );

  return (
    <div className="p-5 space-y-4">
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCharge}
          disabled={selectedIds.length === 0}
        >
          선택 항목 충전 처리
        </Button>
      </div>

      <DataGrid
        columns={COLUMNS}
        rows={applies}
        getRowId={(row) => row.id}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => {
          setSelectedIds(newSelection);
        }}
        localeText={muiDataGridKoreanText}
        showToolbar
        isRowSelectable={(row) => {
          if (row.row.is_charged) return false;
          return true;
        }}
        slotProps={{
          toolbar: {
            csvOptions: {
              fileName: "신청목록",
              utf8WithBom: true,
            },
          },
        }}
      />
    </div>
  );
};

export default Apply;
