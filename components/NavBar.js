"use client";

import React, { useState } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Drawer,
  IconButton,
} from "@mui/material";
import { ExpandLess, ExpandMore, Menu } from "@mui/icons-material";
import GroupIcon from "@mui/icons-material/Group";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { useParams, useRouter } from "next/navigation";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Image from "next/image";
import { MENU } from "@/data/navbar";

const NavBar = () => {
  const router = useRouter();
  const [openedItem, setOpenedItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleItemClick = (item) => {
    setOpenedItem((prev) => (prev === item ? null : item));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const onClick = (path) => {
    router.push(`/admin${path}`);
  };

  const drawerContent = (
    <List>
      <div className="flex items-center px-8 mb-2">
        <div className="w-full aspect-[3/1] relative">
          <Image
            src="/images/logo.png"
            fill
            alt="대생체 로고"
            objectFit="contain"
          />
        </div>
      </div>

      {/* 대쉬보드 */}

      {MENU.map((group, groupIndex) => {
        if (!group.items) {
          return (
            <ListItemButton
              onClick={() => onClick(group.link)}
              key={groupIndex}
            >
              <ListItemIcon>
                <DashboardRoundedIcon />
              </ListItemIcon>
              <ListItemText primary={group.text} className="font-bold" />
            </ListItemButton>
          );
        } else {
          return (
            <div key={groupIndex}>
              <ListItemButton onClick={() => handleItemClick(groupIndex)}>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText
                  primary={group.text}
                  sx={{ pr: 4 }}
                  className="font-bold"
                />
                {openedItem === groupIndex ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              {group?.items && (
                <Collapse
                  in={openedItem === groupIndex}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {group.items.map((item, itemIndex) => {
                      return (
                        <ListItemButton
                          sx={{ pl: 4, pr: 4 }}
                          onClick={() => onClick(item.link)}
                          key={itemIndex}
                        >
                          <ListItemIcon>
                            <AccountBoxOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            className="font-bold"
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </div>
          );
        }
      })}
    </List>
  );

  return (
    <div className="flex">
      {/* PC Navbar */}
      <div
        className="
        hidden md:flex 
        bg-white border-r border-gray-200
       
        h-screen
      "
      >
        {drawerContent}
      </div>

      {/* Mobile Navbar */}
      <div className="flex md:hidden">
        <IconButton onClick={handleDrawerToggle}>
          <Menu />
        </IconButton>
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </div>
    </div>
  );
};

export default NavBar;
