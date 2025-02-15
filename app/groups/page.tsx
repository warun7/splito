"use client";

import { GroupsList } from "@/components/groups-list";
import { CreateGroupForm } from "@/components/create-group-form";
import { PageTitle } from "@/components/page-title";
import { motion } from "framer-motion";
import { fadeIn } from "@/utils/animations";

export default function GroupsPage() {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full"
    >
      <PageTitle />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <GroupsList />
        <div className="block">
          <CreateGroupForm />
        </div>
      </div>
    </motion.div>
  );
}
