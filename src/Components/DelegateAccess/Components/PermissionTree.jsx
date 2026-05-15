import { useState, } from 'react';
import { ChevronDown, ChevronRight, Search as SearchIcon } from 'react-feather';
import { useTranslation } from 'react-i18next';
import addStyles from "../styles/permission.module.css";
import { Toggle } from '../../MyMasterCard/CardPurchased';
export const service_name_formatter = (service_name = "", lower = false) => {
    return service_name.split("_").map(item => `${item[0].toUpperCase()}${lower ? item.slice(1).toLowerCase() : item.slice(1)}`).join(" ")
}

const PermissionTree = ({
    processedPermissions,
    isSelected,
    isIndeterminate,
    togglePermission,
    permSearch,
    setPermSearch,
    isSuperAdmin,
    isDisabled
}) => {
    const [expandedModules, setExpandedModules] = useState({});
    const { t } = useTranslation()
    const filteredPerms = processedPermissions.filter(m =>
        m.module.toLowerCase().includes(permSearch.toLowerCase()) ||
        m.features.some(f =>
            (f.feature && f.feature.toLowerCase().includes(permSearch.toLowerCase())) ||
            f.actions.some(a => a.description.toLowerCase().includes(permSearch.toLowerCase()) || a.key.toLowerCase().includes(permSearch.toLowerCase()))
        )
    );
    console.log("DISABLED =>", isDisabled)
    return (
        <div className={addStyles.inp_con}>
            <label>{t("Permissions Hierarchy")}</label>
            <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "1rem", maxHeight: "400px", overflowY: "auto" }}>
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                    <SearchIcon size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                    <input
                        type="text"
                        placeholder="Search permissions..."
                        value={permSearch}
                        onChange={e => setPermSearch(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                    />
                </div>

                {filteredPerms.map(m => (
                    <div key={m.module} style={{ marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0" }}>
                            <div onClick={() => setExpandedModules(prev => ({ ...prev, [m.module]: !prev[m.module] }))} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                                {expandedModules[m.module] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            {/* <input
                                className={addStyles.checkInput}
                                type="checkbox"
                                checked={isSelected(m.module, "module") || isSuperAdmin}
                                ref={el => el && (el.indeterminate = isIndeterminate(m.module, "module"))}
                                onChange={() => togglePermission(m.module, null, "module")}
                            /> */}

                            <Toggle
                                disabled={isSuperAdmin}
                                checked={isSelected(m.module, "module") || isSuperAdmin}
                                ref={el => el && (el.indeterminate = isIndeterminate(m.module, "module"))}
                                onChange={() => togglePermission(m.module, null, "module")}

                            />


                            <span style={{ fontWeight: 600 }}>{service_name_formatter(m.module)}</span>
                        </div>

                        {expandedModules[m.module] && (
                            <div style={{ marginLeft: "2rem", borderLeft: "2px solid #f0f0f0", paddingLeft: "0.5rem" }}>
                                {m.features.map(f => {
                                    const fKey = f.feature ? `${m.module}.${f.feature}` : "general";
                                    return (
                                        <div key={fKey} style={{ marginBottom: "0.3rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0" }}>
                                                {f.feature && (
                                                    <>
                                                        <Toggle
                                                            className={addStyles.checkInput}
                                                            type="checkbox"
                                                            disabled={isSuperAdmin}
                                                            checked={isSelected(fKey, "feature") || isSuperAdmin}
                                                            ref={el => el && (el.indeterminate = isIndeterminate(fKey, "feature"))}
                                                            onChange={() => togglePermission(fKey, m.module, "feature")}
                                                        />
                                                        <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>{service_name_formatter(f.feature)}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div style={{ marginLeft: f.feature ? "1.5rem" : "0", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                                {f.actions.map(a => (
                                                    <div key={a.key} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.2rem 0" }}>
                                                        <Toggle
                                                            className={addStyles.checkInput}
                                                            type="checkbox"
                                                            disabled={isSuperAdmin || isDisabled}
                                                            checked={isSelected(a.key, "action") || isSuperAdmin}
                                                            onChange={() => togglePermission(a.key, fKey, "action")}
                                                        />
                                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                                            <span style={{ fontSize: "0.9rem" }}>{service_name_formatter(a.action)}</span>
                                                            <span style={{ fontSize: "0.75rem", color: "#888" }}>{a.description}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PermissionTree;
