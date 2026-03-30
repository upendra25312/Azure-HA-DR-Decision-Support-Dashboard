export function cleanValue(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

export function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function slugify(value) {
    return cleanValue(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function formatDate(value) {
    const cleaned = cleanValue(value);

    if (!cleaned) {
        return "Not dated";
    }

    const parsed = new Date(cleaned);

    if (Number.isNaN(parsed.getTime())) {
        return cleaned;
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(parsed);
}

export function uniqueValues(rows, key) {
    return [...new Set(rows.map((row) => cleanValue(row[key])).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right));
}

export function canonicalizeServiceName(value) {
    const cleaned = cleanValue(value).toLowerCase();

    const aliases = {
        "aad b2c": "Azure AD B2C",
        acr: "Azure Container Registry",
        adf: "Azure Data Factory",
        adx: "Azure Data Explorer",
        afd: "Azure Front Door",
        aks: "Azure Kubernetes Service (AKS)",
        apim: "API Management",
        "app gateway": "Azure Application Gateway",
        "app service": "Azure App Service",
        "app services": "Azure App Service",
        "application gateway": "Azure Application Gateway",
        aro: "Azure Red Hat OpenShift",
        ars: "Azure Route Server",
        avs: "Azure VMware Solution",
        backup: "Azure Backup",
        bastion: "Azure Bastion",
        "bot service": "Azure Bot Service",
        "cognitive search": "Azure AI Search",
        "cognitive services": "Azure AI Services",
        "container apps": "Azure Container Apps",
        cosmosdb: "Azure Cosmos DB",
        "data factory": "Azure Data Factory",
        "data gateways": "On-premises Data Gateway",
        databricks: "Azure Databricks",
        defender: "Microsoft Defender for Cloud",
        dns: "Azure DNS",
        entra: "Microsoft Entra ID",
        "event hubs": "Azure Event Hubs",
        expressroute: "Azure ExpressRoute",
        firewall: "Azure Firewall",
        "front door": "Azure Front Door",
        functions: "Azure Functions",
        hci: "Azure Stack HCI",
        iot: "Azure IoT Hub",
        "iot hub dps": "Azure Device Provisioning Service",
        "key vault": "Azure Key Vault",
        "logic apps": "Azure Logic Apps",
        "azure application gateway": "Azure Application Gateway",
        "azure ai content safety": "Azure AI Content Safety",
        "azure ai foundry": "Azure AI Foundry",
        "azure ai search": "Azure AI Search",
        "azure ai services": "Azure AI Services",
        "azure api management": "API Management",
        "azure container apps": "Azure Container Apps",
        "azure container registry": "Azure Container Registry",
        "azure cost management": "Azure Cost Management",
        "azure data explorer": "Azure Data Explorer",
        "azure data factory": "Azure Data Factory",
        "azure devops": "Azure DevOps",
        "azure functions": "Azure Functions",
        "azure key vault": "Azure Key Vault",
        "azure machine learning": "Azure Machine Learning",
        "azure monitor": "Azure Monitor",
        "azure mysql": "Azure Database for MySQL",
        "azure open ai": "Azure OpenAI",
        "azure openai": "Azure OpenAI",
        "azure public ip": "Azure Public IP",
        "azure resource manager": "Azure Resource Manager",
        "azure rbac": "Azure RBAC",
        "azure service fabric": "Azure Service Fabric",
        "azure service health": "Azure Service Health",
        "azure spring apps": "Azure Spring Apps",
        "azure sql database": "Azure SQL Database",
        "azure storage": "Azure Storage Account",
        "azure storage account": "Azure Storage Account",
        "azure virtual machines": "Azure Virtual Machines",
        "azure virtual wan": "Azure Virtual WAN",
        "azure vpn gateway": "Azure VPN Gateway",
        "device update for iot hub": "Device Update for IoT Hub",
        "load balancer": "Azure Load Balancer",
        "azure load balancer": "Azure Load Balancer",
        "microsoft cloud security benchmark": "Microsoft Cloud Security Benchmark",
        "microsoft defender for cloud": "Microsoft Defender for Cloud",
        "microsoft entra": "Microsoft Entra ID",
        "microsoft fabric": "Microsoft Fabric",
        "microsoft purview": "Microsoft Purview",
        "microsoft threat modeling tool": "Microsoft Threat Modeling Tool",
        monitor: "Azure Monitor",
        "network watcher": "Azure Network Watcher",
        nsg: "Network Security Groups",
        nva: "Network Virtual Appliance",
        policy: "Azure Policy",
        postgresql: "Azure Database for PostgreSQL",
        purview: "Microsoft Purview",
        redis: "Azure Cache for Redis",
        sap: "SAP on Azure",
        "service bus": "Azure Service Bus",
        "site recovery": "Azure Site Recovery",
        "spring apps": "Azure Spring Apps",
        sql: "Azure SQL Database",
        storage: "Azure Storage Account",
        synapse: "Azure Synapse Analytics",
        "synapse analytics": "Azure Synapse Analytics",
        "traffic manager": "Azure Traffic Manager",
        "public ip addresses": "Azure Public IP",
        vm: "Azure Virtual Machines",
        vmss: "Azure Virtual Machine Scale Sets",
        "windows ad": "Active Directory Domain Services",
        vnet: "Azure Virtual Network",
        vpn: "Azure VPN Gateway",
        vwan: "Azure Virtual WAN",
        waf: "Web Application Firewall"
    };

    return aliases[cleaned] || cleanValue(value);
}

export function parseCsvLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        const nextCharacter = line[index + 1];

        if (character === "\"") {
            if (inQuotes && nextCharacter === "\"") {
                current += "\"";
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (character === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
        } else {
            current += character;
        }
    }

    values.push(current.trim());
    return values;
}

export function parseCSV(text) {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

    if (!lines.length) {
        return [];
    }

    const headers = parseCsvLine(lines[0]);

    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || "";
        });

        return row;
    });
}

export function splitToSentences(value) {
    return cleanValue(value)
        .split(/(?<=[.!?])\s+/)
        .map((segment) => cleanValue(segment))
        .filter(Boolean);
}

export function sentenceList(value, limit = 3) {
    return splitToSentences(value).slice(0, limit);
}

export function listFromDelimited(value) {
    return cleanValue(value)
        .split(/[,;]|\band\b/i)
        .map((segment) => cleanValue(segment))
        .filter(Boolean);
}

export function summarizeCount(items, label) {
    return `${items} ${label}${items === 1 ? "" : "s"}`;
}

export function isHiddenPublicSourceUrl(value) {
    const cleaned = cleanValue(value).toLowerCase();

    if (!cleaned) {
        return false;
    }

    return cleaned.startsWith("https://github.com/azure/review-checklists")
        || cleaned.startsWith("http://github.com/azure/review-checklists")
        || cleaned.startsWith("https://www.github.com/azure/review-checklists")
        || cleaned.startsWith("http://www.github.com/azure/review-checklists");
}
