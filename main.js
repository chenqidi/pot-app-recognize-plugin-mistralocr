async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    let { keepMarkdownFormat, apiKey } = config;

    const requestPath = "https://api.mistral.ai/v1/ocr";

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    }

    const body = {
        model: "mistral-ocr-latest",
        document: {
            type: "image_url",
            image_url: `data:image/png;base64,${base64}`
        },
        include_image_base64: true
    };

    let res = await fetch(requestPath, {
        method: 'POST',
        url: requestPath,
        headers: headers,
        body: {
            type: "Json",
            payload: body
        }
    });

    if (res.ok) {
        let result = res.data;
        const markdownText = result?.pages?.[0]?.markdown || "No text found";
        if (keepMarkdownFormat === "Yes") {
            return markdownText;
        } else {
            return markdownToPlainText(markdownText) || "No text found";
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 将Markdown格式转换为纯文本
function markdownToPlainText(markdown) {
    if (!markdown) return "No text found";
    
    // 处理标题（# ## ###）
    let plainText = markdown.replace(/^#{1,6}\s+(.*?)$/gm, '$1');
    
    // 处理加粗文本 **text**
    plainText = plainText.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // 处理斜体文本 *text* 或 _text_
    plainText = plainText.replace(/(\*|_)(.*?)\1/g, '$2');
    
    // 处理链接 [text](url)
    plainText = plainText.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    
    // 处理列表项
    plainText = plainText.replace(/^[\*\-\+]\s+(.*?)$/gm, '$1');
    plainText = plainText.replace(/^\d+\.\s+(.*?)$/gm, '$1');
    
    // 处理引用 > text
    plainText = plainText.replace(/^>\s+(.*?)$/gm, '$1');
    
    // 处理代码块
    plainText = plainText.replace(/```[\s\S]*?```/g, '');
    
    // 处理行内代码
    plainText = plainText.replace(/`(.*?)`/g, '$1');
    
    // 删除多余空行
    plainText = plainText.replace(/\n{3,}/g, '\n\n');
    
    return plainText.trim();
}
