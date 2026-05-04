import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Box,
  Brain,
  FlaskConical,
  Download,
  Key,
  ShieldAlert,
  Pencil,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Field, SqlType } from "@data-weave/shared";

const typeColorMap: Record<string, string> = {
  uuid: "text-violet-400",
  serial: "text-violet-400",
  text: "text-emerald-400",
  varchar: "text-emerald-400",
  int: "text-amber-400",
  bigint: "text-amber-400",
  float: "text-amber-400",
  decimal: "text-amber-400",
  boolean: "text-sky-400",
  date: "text-rose-400",
  timestamp: "text-rose-400",
  timestamptz: "text-rose-400",
  json: "text-orange-400",
  jsonb: "text-orange-400",
};

function FieldItem({ field }: { field: Field }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-xs text-zinc-400">
      {field.constraints.primaryKey && (
        <Key className="h-3 w-3 text-yellow-400 shrink-0" />
      )}
      {field.isPII && <ShieldAlert className="h-3 w-3 text-red-400 shrink-0" />}
      <span className="truncate flex-1">{field.name}</span>
      <span
        className={cn(
          "font-mono text-[10px]",
          typeColorMap[field.type] ?? "text-zinc-600",
        )}
      >
        {field.type}
      </span>
    </div>
  );
}

// ─── Data Generation Panel ──────────────────────────────────────────

import { faker } from "@faker-js/faker";
import type { GenerationMode } from "@data-weave/shared";

/** Clearly Mock mode — deterministic, obviously fake data using faker */
function generateMockValue(
  type: SqlType,
  fieldName: string,
  index: number,
): unknown {
  faker.seed(index * 31 + fieldName.length);
  switch (type) {
    case "uuid":
      return faker.string.uuid();
    case "serial":
      return index + 1;
    case "text":
    case "varchar": {
      const lower = fieldName.toLowerCase();
      if (lower.includes("email")) return faker.internet.email();
      if (lower.includes("name") && lower.includes("first"))
        return faker.person.firstName();
      if (lower.includes("name") && lower.includes("last"))
        return faker.person.lastName();
      if (lower.includes("name")) return faker.person.fullName();
      if (lower.includes("phone")) return faker.phone.number();
      if (lower.includes("address") || lower.includes("street"))
        return faker.location.streetAddress();
      if (lower.includes("city")) return faker.location.city();
      if (lower.includes("country")) return faker.location.country();
      if (lower.includes("url") || lower.includes("website"))
        return faker.internet.url();
      if (lower.includes("description") || lower.includes("bio"))
        return faker.lorem.sentence();
      if (lower.includes("title")) return faker.commerce.productName();
      if (lower.includes("company")) return faker.company.name();
      return faker.lorem.words(2);
    }
    case "int":
    case "bigint":
      return faker.number.int({ min: 1, max: 99999 });
    case "float":
    case "decimal": {
      const lower = fieldName.toLowerCase();
      if (
        lower.includes("price") ||
        lower.includes("amount") ||
        lower.includes("total")
      )
        return +faker.commerce.price({ min: 1, max: 500 });
      return +faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
    }
    case "boolean":
      return faker.datatype.boolean();
    case "date":
      return faker.date.past({ years: 3 }).toISOString().split("T")[0];
    case "timestamp":
    case "timestamptz":
      return faker.date.past({ years: 2 }).toISOString();
    case "json":
    case "jsonb":
      return { [faker.lorem.word()]: faker.lorem.word() };
    default:
      return null;
  }
}

/** Realistic mode — domain-aware, HK/SG flavored realistic data */
function generateRealisticValue(
  type: SqlType,
  fieldName: string,
  index: number,
): unknown {
  faker.seed(index * 37 + fieldName.length + 7);
  // Use locale-flavoured realistic generation
  const hkSurnames = [
    "Chan",
    "Wong",
    "Lam",
    "Cheung",
    "Lee",
    "Ng",
    "Ho",
    "Tang",
    "Yuen",
    "Liu",
  ];
  const hkFirstNames = [
    "Wing",
    "Ka",
    "Hoi",
    "Tsz",
    "Lok",
    "Wai",
    "Sze",
    "Man",
    "Chi",
    "Yan",
  ];
  const sgSurnames = [
    "Tan",
    "Lim",
    "Lee",
    "Ng",
    "Wong",
    "Goh",
    "Chua",
    "Ong",
    "Koh",
    "Teo",
  ];
  const sgFirstNames = [
    "Wei",
    "Jun",
    "Yi",
    "Xin",
    "Hui",
    "Jia",
    "Ming",
    "Zhi",
    "Hao",
    "Ling",
  ];

  switch (type) {
    case "uuid":
      return crypto.randomUUID();
    case "serial":
      return index + 1;
    case "text":
    case "varchar": {
      const lower = fieldName.toLowerCase();
      if (lower.includes("email")) {
        const surname = hkSurnames[index % hkSurnames.length].toLowerCase();
        return `${surname}${faker.number.int({ min: 10, max: 99 })}@${faker.helpers.arrayElement(["gmail.com", "outlook.com", "company.hk", "mail.sg"])}`;
      }
      if (lower.includes("name") && lower.includes("first")) {
        return faker.helpers.arrayElement([...hkFirstNames, ...sgFirstNames]);
      }
      if (lower.includes("name") && lower.includes("last")) {
        return faker.helpers.arrayElement([...hkSurnames, ...sgSurnames]);
      }
      if (lower.includes("name")) {
        const surname = faker.helpers.arrayElement([
          ...hkSurnames,
          ...sgSurnames,
        ]);
        const first = faker.helpers.arrayElement([
          ...hkFirstNames,
          ...sgFirstNames,
        ]);
        return `${surname} ${first}`;
      }
      if (lower.includes("phone"))
        return `+852 ${faker.string.numeric(4)} ${faker.string.numeric(4)}`;
      if (lower.includes("address"))
        return `${faker.number.int({ min: 1, max: 200 })} ${faker.helpers.arrayElement(["Queen's Road", "Nathan Road", "Des Voeux Road", "Orchard Road", "Raffles Place"])} #${faker.string.numeric(2)}-${faker.string.numeric(2)}`;
      if (lower.includes("city"))
        return faker.helpers.arrayElement([
          "Hong Kong",
          "Kowloon",
          "Singapore",
          "Tsuen Wan",
          "Sha Tin",
        ]);
      if (lower.includes("country"))
        return faker.helpers.arrayElement(["HK", "SG", "MY", "TW", "JP"]);
      if (lower.includes("status"))
        return faker.helpers.arrayElement([
          "active",
          "pending",
          "completed",
          "cancelled",
        ]);
      if (lower.includes("title") || lower.includes("product"))
        return faker.commerce.productName();
      if (lower.includes("company"))
        return `${faker.helpers.arrayElement(["Asia", "Pacific", "Dragon", "Golden", "Star"])} ${faker.helpers.arrayElement(["Tech", "Trading", "Holdings", "Solutions", "Digital"])} Ltd`;
      if (lower.includes("description"))
        return faker.commerce.productDescription();
      return faker.lorem.words(3);
    }
    case "int":
    case "bigint": {
      const lower = fieldName.toLowerCase();
      if (lower.includes("quantity") || lower.includes("qty"))
        return faker.number.int({ min: 1, max: 50 });
      if (lower.includes("age")) return faker.number.int({ min: 18, max: 75 });
      return faker.number.int({ min: 1, max: 10000 });
    }
    case "float":
    case "decimal": {
      const lower = fieldName.toLowerCase();
      if (lower.includes("price"))
        return +faker.number.float({ min: 10, max: 2000, fractionDigits: 2 });
      if (lower.includes("amount") || lower.includes("total"))
        return +faker.number.float({ min: 50, max: 5000, fractionDigits: 2 });
      if (lower.includes("rate"))
        return +faker.number.float({ min: 0, max: 1, fractionDigits: 4 });
      return +faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
    }
    case "boolean":
      return faker.datatype.boolean({ probability: 0.7 });
    case "date":
      return faker.date
        .between({ from: "2022-01-01", to: "2026-05-01" })
        .toISOString()
        .split("T")[0];
    case "timestamp":
    case "timestamptz":
      return faker.date
        .between({ from: "2023-01-01", to: "2026-05-01" })
        .toISOString();
    case "json":
    case "jsonb":
      return {
        preferences: {
          locale: faker.helpers.arrayElement(["zh-HK", "en-SG", "en-US"]),
          currency: faker.helpers.arrayElement(["HKD", "SGD", "USD"]),
        },
      };
    default:
      return null;
  }
}

const DataGenerationPanel = observer(() => {
  const { schema } = useStore();
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [rowCount, setRowCount] = useState(10);
  const [mode, setMode] = useState<GenerationMode>("realistic");
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<
    Record<string, unknown>[] | null
  >(null);
  const [geoPermission, setGeoPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [geoError, setGeoError] = useState<string | null>(null);

  // Check geolocation permission on mount
  useState(() => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setGeoPermission(result.state as "prompt" | "granted" | "denied");
        result.addEventListener("change", () => {
          setGeoPermission(result.state as "prompt" | "granted" | "denied");
        });
      });
    }
  });

  const entity = schema.schema.entities.find((e) => e.id === selectedEntityId);

  const getGeolocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoPermission("granted");
          setGeoError(null);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setGeoPermission("denied");
            setGeoError(
              "Location permission denied. Enable it in browser settings to use Realistic mode.",
            );
          }
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    });
  };

  const handleGenerate = async () => {
    if (!entity) return;
    setGenerating(true);
    setGeoError(null);

    if (mode === "realistic") {
      try {
        const { latitude, longitude } = await getGeolocation();
        const response = await fetch("http://localhost:3001/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity, rowCount, latitude, longitude }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        setGeneratedData(Array.isArray(data) ? data : [data]);
      } catch {
        if (geoPermission === "denied") {
          setGenerating(false);
          return;
        }
        // Fallback to local realistic generation
        const rows: Record<string, unknown>[] = [];
        for (let i = 0; i < rowCount; i++) {
          const row: Record<string, unknown> = {};
          for (const field of entity.fields) {
            row[field.name] = generateRealisticValue(field.type, field.name, i);
          }
          rows.push(row);
        }
        setGeneratedData(rows);
      }
    } else {
      // Mock mode — local faker generation
      const rows: Record<string, unknown>[] = [];
      for (let i = 0; i < rowCount; i++) {
        const row: Record<string, unknown> = {};
        for (const field of entity.fields) {
          row[field.name] = generateMockValue(field.type, field.name, i);
        }
        rows.push(row);
      }
      setGeneratedData(rows);
    }
    setGenerating(false);
  };

  const handleCopyJSON = () => {
    if (generatedData) {
      navigator.clipboard.writeText(JSON.stringify(generatedData, null, 2));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">
        Synthetic Data Generator
      </p>

      <div className="space-y-2">
        <Label className="text-xs">Table</Label>
        <Select
          value={selectedEntityId}
          onValueChange={(val) => {
            setSelectedEntityId(val);
            setGeneratedData(null);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select table..." />
          </SelectTrigger>
          <SelectContent>
            {schema.schema.entities.map((ent) => (
              <SelectItem key={ent.id} value={ent.id}>
                {ent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Mode</Label>
        <Select
          value={mode}
          onValueChange={(val) => {
            setMode(val as GenerationMode);
            setGeneratedData(null);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="realistic">
              🌏 Realistic (AI + geolocation)
            </SelectItem>
            <SelectItem value="mock">
              🧪 Clearly Mock (faker, deterministic)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-zinc-600">
          {mode === "realistic"
            ? "AI-powered via DuckLLM gpt-5 — uses your location for locale-aware data"
            : "Obviously fake test data using @faker-js/faker with deterministic seeding"}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Row Count</Label>
        <Input
          type="number"
          min={1}
          max={1000}
          value={rowCount}
          onChange={(e) => setRowCount(Number(e.target.value))}
          className="h-8 text-xs"
        />
      </div>

      {geoError && <p className="text-[10px] text-red-400">{geoError}</p>}

      <Button
        size="sm"
        className="w-full"
        disabled={!selectedEntityId || generating}
        onClick={handleGenerate}
      >
        {generating && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
        {generating ? "Generating..." : "Generate Data"}
      </Button>

      {generatedData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">
              {generatedData.length} rows • {mode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px]"
              onClick={handleCopyJSON}
            >
              Copy JSON
            </Button>
          </div>
          <div className="max-h-60 overflow-auto rounded-md bg-zinc-950 border border-zinc-800 p-2">
            <pre className="text-[10px] text-zinc-400 whitespace-pre-wrap">
              {JSON.stringify(generatedData.slice(0, 5), null, 2)}
              {generatedData.length > 5 &&
                `\n... +${generatedData.length - 5} more rows`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Sidebar ────────────────────────────────────────────────────────

export const Sidebar = observer(() => {
  const { ui, schema } = useStore();

  const handleSelectEntity = (entityId: string) => {
    ui.selectEntity(entityId);
  };

  return (
    <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-bold text-indigo-400">⬡ DataWeave</h1>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          AI Data Architecture Lab
        </p>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        value={ui.sidebarTab}
        onValueChange={(v) => ui.setSidebarTab(v as typeof ui.sidebarTab)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-3 mt-3 w-auto grid grid-cols-4">
          <TabsTrigger value="entities">
            <Box className="h-3.5 w-3.5" />
          </TabsTrigger>
          <TabsTrigger value="whatif">
            <Brain className="h-3.5 w-3.5" />
          </TabsTrigger>
          <TabsTrigger value="data">
            <FlaskConical className="h-3.5 w-3.5" />
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-3.5 w-3.5" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-3 py-2">
          <TabsContent value="entities" className="mt-0">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">
              Schema: {schema.schema.name}
            </p>
            <Accordion
              type="single"
              collapsible
              value={ui.selectedEntityId ?? undefined}
              onValueChange={(val) => handleSelectEntity(val)}
            >
              {schema.schema.entities.map((entity) => (
                <AccordionItem
                  key={entity.id}
                  value={entity.id}
                  className={cn(
                    "rounded-md transition-colors",
                    ui.selectedEntityId === entity.id &&
                      "bg-indigo-600/10 border-indigo-500/30",
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      ui.selectedEntityId === entity.id && "text-indigo-300",
                    )}
                  >
                    <span className="flex-1 text-left truncate">
                      {entity.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 mr-1">
                      {entity.fields.length}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-0.5 pl-5">
                      {entity.fields.map((f) => (
                        <FieldItem key={f.id} field={f} />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                      onClick={() => ui.openEditEntity(entity.id)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit Table
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="whatif" className="mt-0">
            <div className="text-zinc-500 text-xs space-y-2">
              <p>AI Schema Architect — coming next batch.</p>
              <p className="text-zinc-600">
                Will analyze your schema and suggest improvements.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <DataGenerationPanel />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <p className="text-zinc-500 text-xs">
              Export options — coming next batch.
            </p>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
});
