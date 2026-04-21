"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Car, Bike, Truck, Search, History, Scale, 
  ChevronRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2,
  Calculator, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Skeleton, CalculatorResultSkeleton } from "@/components/ui/Skeleton";
import { dataLoader } from "@/lib/data/data-loader";
import { SmartSearch } from "@/lib/search/smart-search";
import { VEHICLE_TYPES, VIOLATION_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { WhatsAppShare } from "@/components/shared/WhatsAppShare";
import { animations } from "@/lib/animations";
import { resolveViolation } from "@/lib/law-engine/resolver"; 
import { Step3ConfirmSubmit } from "@/components/calculator/Step3ConfirmSubmit";
import { ResultCard } from "@/components/calculator/ResultCard";
import { queryViolations } from "@/lib/law-engine/engine";
import type { QueryResult } from "@/lib/law-engine/types";
import type { Violation } from "@/lib/law-engine/schema";

import { CalculatorManager } from "@/components/calculator/CalculatorManager";

export default function CalculatorPage() {
  return <CalculatorManager />;
}
