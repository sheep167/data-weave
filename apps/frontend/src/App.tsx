import { SchemaCanvas } from "./components/canvas/SchemaCanvas";
import { Sidebar } from "./components/Sidebar";
import { EntityDrawer } from "./components/EntityDrawer";

export function App() {
    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative">
                <SchemaCanvas />
            </main>
            <EntityDrawer />
        </div>
    );
}
