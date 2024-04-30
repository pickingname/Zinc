"use client";

{
  /* imports */
}
import { ModeToggle } from "@/components/ui/themechanger";
import Image from "next/image";
import { Loader2, Pen, SquarePen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useEffect } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Gauge } from "lucide-react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  LineChart,
  ListFilter,
  MoreVertical,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users2,
  HomeIcon,
} from "lucide-react";

import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { overrideGlobalXHR } from "tauri-xhr";
import axios from "axios";

let initialFirstOffline = false;
let initialFirstOnline = true;
const appstarttime = new Date().toLocaleString() + "";

export default function Home() {
  let [online, setOnline] = useState<boolean>(false);
  let [ping, setPing] = useState<number>(0);
  let [pingPercentage, setPingPercentage] = useState<number>(0);
  let [statuscode, setstatuscode] = useState<number>(0);
  const [statustext, setstatustext] = useState<string>("unknown");
  let [fetching, setFetching] = useState<boolean>(true);
  let [pingHistory, setPingHistory] = useState<
    Array<{ ping: number; status: string; date: string }>
  >([]);
  let [attempts, setAttempts] = useState<number>(1);
  let [pingChanges, setPingChanges] = useState<Array<number>>([]);
  let [lastTenPingValues, setLastTenPingValues] = useState<number[]>([]);
  const [webtype, setWebtype] = useState<string>("unknown");
  let [totalRequests, setTotalRequests] = useState<number>(0);
  const [ip, setIP] = useState("");
  let [totalonline, settotalonline] = useState<number>(0);
  let [totaloffline, settotaloffline] = useState<number>(0);
  const [wasdurl, setWasdurl] = useState("");
  const [wasdname, setWasdname] = useState("");

  useEffect(() => {
    // Perform localStorage action
    const url = localStorage.getItem("url");
    const name = localStorage.getItem("name");

    if (url) {
      setWasdurl(url);
    }

    if (name) {
      setWasdname(name);
    }
  }, []);

  function secstotime(seconds: number) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }

  const getData = async () => {
    try {
      const res = await axios.get("https://api.ipify.org/?format=json");
      console.log(res.data);
      setIP(res.data.ip);
    } catch (error) {
      console.error(error);
    }
  };

  let websitename = wasdname;
  let websitetogetstatus = wasdurl;

  const thumblink =
    "https://www.google.com/s2/favicons?domain=" + websitetogetstatus;

  let pinglimit: string | null = null;
  if (typeof window !== "undefined") {
    pinglimit = window.localStorage.getItem("pinglimit");
  }

  let averagepingvaluetogetRAW = 10;
  let to_round = 1;

  let averagepingvaluetoget = averagepingvaluetogetRAW - 1;

  useEffect(() => {
    websitename = wasdname;
    websitetogetstatus = wasdurl;
    getData();
    overrideGlobalXHR(); /* override the xhr to disable cors */
    let webtype = "Not yet acquired";

    if (
      localStorage.getItem("url") &&
      localStorage.getItem("url")?.startsWith("http://")
    ) {
      setWebtype("http");
    } else if (
      localStorage.getItem("url") &&
      localStorage.getItem("url")?.startsWith("https://")
    ) {
      setWebtype("https");
    } else {
      setWebtype("unknown");
    }

    let checkStatus = async () => {
      try {
        setTotalRequests((prevTotal) => prevTotal + 1);

        // code isolation because its important ping metrics TEST

        let startTime = Date.now();

        let res = await axios.get(localStorage.getItem("url") ?? ""); // null check

        let endTime = Date.now();

        setstatuscode(res.status);
        setstatustext(res.statusText);
        setOnline(true);
        settotalonline((prevTotal) => prevTotal + 1);

        if (initialFirstOnline) {
          toast.success("Website is online!");
          new Audio(
            "https://pickingname.github.io/datastores/get/sounds/yes.mp3"
          ).play();
          initialFirstOffline = true;
          initialFirstOnline = false;
        }

        let currentPing = endTime - startTime;
        setPing(currentPing); // Provide a default value of 0 if the retrieved value is null
        if (pinglimit) {
          let pingLimitNumber = parseFloat(pinglimit);
          let percentage = Math.min((currentPing / pingLimitNumber) * 100, 100);
          setPingPercentage(Number(percentage.toFixed(to_round)));
        }

        if (pingHistory.length > 0) {
          let lastPing = pingHistory[0].ping;
          let change = ((currentPing - lastPing) / lastPing) * 100;
          setPingChanges((prevChanges) => [change, ...prevChanges.slice(0, 4)]);
        }

        setPingHistory((prevHistory) => [
          {
            ping: currentPing,
            status: "Online",
            date: new Date().toLocaleString(),
          },
          ...prevHistory.slice(0, 4),
        ]);

        setLastTenPingValues((prevValues) => [
          currentPing,
          ...prevValues.slice(0, averagepingvaluetoget),
        ]);
        setFetching(false);
      } catch (error) {
        settotaloffline((prevTotal) => prevTotal + 1);
        setOnline(false);
        setstatuscode(408);
        setstatustext("server cannot be reached");
        if (initialFirstOffline) {
          toast.error("website is offline");
          new Audio(
            "https://pickingname.github.io/datastores/get/sounds/no.mp3"
          ).play();
          initialFirstOffline = false;
          initialFirstOnline = true;
        }
        setOnline(false);
        setPing(0);
        setPingPercentage(0);
        setFetching(false);

        setPingHistory((prevHistory) => [
          { ping: 0, status: "offline", date: new Date().toLocaleString() },
          ...prevHistory.slice(0, 4),
        ]);
      }
    };

    let interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  let averagePing =
    lastTenPingValues.reduce((acc, curr) => acc + curr, 0) /
    lastTenPingValues.length;

  return (
    <main className="font-outfit">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {" "}
        {/* main */}
        <div className="flex flex-col sm:gap-4 sm:py-4">
          {" "}
          {/* main div */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            {" "}
            {/* header that contains the breadcrumbs, search, and user profile */}
            <Breadcrumb className="flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <BreadcrumbPage>dash</BreadcrumbPage>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <BreadcrumbPage>{websitename}</BreadcrumbPage>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{websitetogetstatus}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <div
                    className={
                      online
                        ? " w-full h-full bg-green-500 animate-pulse motion-safe:animate-none"
                        : " w-full h-full bg-red-500 animate-pulse motion-safe:animate-none"
                    }
                  ></div>
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            {" "}
            {/* main dashboard that contains the blocks and grids */}
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              {" "}
              {/* all of the blocks are contained here, except reciept card */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {" "}
                {/* top row cards (fetcher, ping, avgms) */}
                <Card
                  className="sm:col-span-2 shadow-lg"
                  x-chunk="dashboard-05-chunk-0"
                >
                  <CardHeader className="pb-3">
                    <CardTitle>Fetcher</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      Currently getting data from {websitetogetstatus}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    {/* Render different buttons based on the fetching state */}
                    {fetching ? (
                      <Button disabled className="shadow-lg">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait while we make the first request
                      </Button>
                    ) : (
                      <Button
                        variant={online ? "default" : "destructive"}
                        className="shadow-lg"
                      >
                        Website is {online ? "Online" : "Offline"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
                <Card x-chunk="dashboard-05-chunk-1" className="shadow-lg">
                  {!fetching && (
                    <div>
                      <CardHeader className="pb-2">
                        <CardDescription>
                          {" "}
                          {online ? "Online" : "Offline"}
                        </CardDescription>
                        <CardTitle className="text-4xl">{ping}ms </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground text-nowrap">
                          That&apos;s {pingPercentage}% of the limit ({pinglimit || 0}
                          ms).
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Progress
                          value={pingPercentage}
                          aria-label="ping percentage"
                        />
                      </CardFooter>
                    </div>
                  )}
                </Card>
                <Card x-chunk="dashboard-05-chunk-2" className="shadow-lg">
                  <CardHeader className="pb-2">
                    <CardDescription>Average ping</CardDescription>{" "}
                    {/* uses the raw value */}
                    <CardTitle className="text-4xl">
                      {isNaN(averagePing) ? "0" : averagePing.toFixed(0)}ms
                    </CardTitle>{" "}
                    {/* no dots */}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      In the last {averagepingvaluetogetRAW} requests
                    </div>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>
              </div>
              <Tabs defaultValue="week">
                {" "}
                {/* tabs that contain the lists */}
                <div className="flex items-center">
                  <div className="ml-auto flex items-center gap-2">
                    <Link href="/">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <SquarePen className="h-3.5 w-3.5" />
                        <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                          <Link href="/">Edit website</Link>
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
                <TabsContent value="week">
                  <Card x-chunk="dashboard-05-chunk-3" className="shadow-lg">
                    <CardHeader className="px-7">
                      <CardTitle>Ping history</CardTitle>
                      <CardDescription>
                        Recent pings from this app
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request</TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Ping
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Time
                            </TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pingHistory.map((entry, index) => (
                            <TableRow
                              key={index}
                              className={
                                entry.status === "offline" ? "bg-accent" : ""
                              }
                            >
                              <TableCell>
                                <div className="font-medium">{websitename}</div>
                                <div className="hidden text-sm text-muted-foreground md:inline">
                                  {websitetogetstatus}
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {entry.ping}ms
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {entry.date}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  className="text-xs"
                                  variant={
                                    entry.status === "offline"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {entry.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              {" "}
              {/* order card */}
              <Card
                className="overflow-hidden shadow-lg"
                x-chunk="dashboard-05-chunk-4"
              >
                <CardHeader className="flex flex-row items-start bg-muted/50">
                  <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">
                      {websitename}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">List</span>
                      </Button>
                    </CardTitle>
                    <CardDescription>{websitetogetstatus}</CardDescription>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <ModeToggle />
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-sm">
                  <div className="grid gap-3">
                    <div className="font-semibold">Website details</div>
                    <ul className="grid gap-3">
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span
                          className={online ? "text-green-600" : "text-red-00"}
                        >
                          {online ? "Online" : "Offline"}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Status code
                        </span>
                        <span>{statuscode}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ping</span>
                        <span>{ping}ms</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Protocol</span>
                        <span>{webtype}</span>
                      </li>
                    </ul>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <div className="font-semibold">Uptime</div>
                      <address className="grid gap-0.5 not-italic text-muted-foreground">
                        {totalonline ? secstotime(totalonline) : "0 seconds"}
                      </address>
                    </div>
                    <div className="grid auto-rows-max gap-3">
                      <div className="font-semibold">Downtime</div>
                      <div className="text-muted-foreground">
                        {totaloffline ? secstotime(totaloffline) : "0 seconds"}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-3">
                    <div className="font-semibold">Application information</div>
                    <dl className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Start date</dt>
                        <dd suppressHydrationWarning>{appstarttime}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">
                          Total requests
                        </dt>
                        <dd>
                          <a>{totalRequests}</a>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between font-outfit">
                        <dt className="text-muted-foreground">Device IP</dt>
                        <dd>
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <span className="underline underline-offset-2">
                                Click to view
                              </span>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  <span className="font-outfit">
                                    Current device ip
                                  </span>
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  <span className="font-mono text-4xl">
                                    {ip}
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-3">
                    <div className="font-semibold">About</div>
                    <dl className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1 text-muted-foreground">
                          <p>
                            <a
                              
                              className="text-blue-400 underline underline-offset-2"
                            >
                              get.app
                            </a>{" "}
                            v1.0.2 Revision n°6
                          </p>
                        </dt>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}
