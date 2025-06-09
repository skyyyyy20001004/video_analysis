// 渲染思维导图 - 全局函数
function renderMindmap(data) {
    // 获取思维导图容器
    const mindmapContainer = document.getElementById('mindmap-container');
    if (!mindmapContainer) {
        console.error('思维导图容器未找到');
        return;
    }
    
    // 清空容器
    mindmapContainer.innerHTML = '';
    
    // 检查数据是否存在
    if (!data || !data.root) {
        console.error('思维导图数据无效');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'text-center text-muted h-100 d-flex align-items-center justify-content-center';
        errorMessage.textContent = '思维导图数据不可用';
        mindmapContainer.appendChild(errorMessage);
        return;
    }
    
    // 转换数据格式为jsMind格式
    function convertToJsMindFormat(node, parentId = null) {
        const nodeId = Math.random().toString(36).substr(2, 9);
        const jsMindNode = {
            id: nodeId,
            topic: node.name || node.text || node.topic || '未命名节点',
            direction: parentId ? 'right' : undefined
        };
        
        if (node.children && node.children.length > 0) {
            jsMindNode.children = node.children.map((child, index) => {
                const childNode = convertToJsMindFormat(child, nodeId);
                // 为子节点设置不同方向，创建更美观的布局
                if (parentId === null) { // 一级节点
                    childNode.direction = index % 2 === 0 ? 'right' : 'left';
                }
                return childNode;
            });
        }
        
        return jsMindNode;
    }
    
    // 转换数据
    const mindData = {
        meta: {
            name: '智能分析思维导图',
            author: 'AI智能分析平台',
            version: '1.0'
        },
        format: 'node_tree',
        data: convertToJsMindFormat(data.root)
    };
    
    // jsMind配置选项
    const options = {
        container: 'mindmap-container',
        theme: 'primary',
        editable: false,
        mode: 'full',
        support_html: true,
        view: {
            hmargin: 100,
            vmargin: 50,
            line_width: 2,
            line_color: '#558B2F'
        },
        layout: {
            hspace: 30,
            vspace: 20,
            pspace: 13
        },
        shortcut: {
            enable: true,
            handles: {},
            mapping: {
                addchild: 45, // Insert
                addbrother: 13, // Enter  
                editnode: 113, // F2
                delnode: 46, // Delete
                toggle: 32, // Space
                left: 37, // Left
                up: 38, // Up
                right: 39, // Right
                down: 40, // Down
            }
        }
    };
    
    // 创建jsMind实例
    try {
        const jm = new jsMind(options);
        jm.show(mindData);
        
        // 添加自定义样式
        setTimeout(() => {
            const mindmapNodes = mindmapContainer.querySelectorAll('jmnode');
            mindmapNodes.forEach((node, index) => {
                // 为不同层级的节点添加不同样式
                const level = node.getAttribute('nodeid') === mindData.data.id ? 0 : 
                            (node.parentNode && node.parentNode.getAttribute('nodeid') === mindData.data.id ? 1 : 2);
                
                if (level === 0) {
                    // 根节点样式
                    node.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    node.style.color = 'white';
                    node.style.fontWeight = 'bold';
                    node.style.fontSize = '16px';
                    node.style.borderRadius = '25px';
                    node.style.padding = '12px 20px';
                    node.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                } else if (level === 1) {
                    // 一级节点样式
                    const colors = [
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                    ];
                    node.style.background = colors[index % colors.length];
                    node.style.color = 'white';
                    node.style.fontWeight = '600';
                    node.style.fontSize = '14px';
                    node.style.borderRadius = '20px';
                    node.style.padding = '10px 16px';
                    node.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
                } else {
                    // 二级节点样式
                    node.style.background = 'rgba(255, 255, 255, 0.95)';
                    node.style.color = '#333';
                    node.style.fontSize = '12px';
                    node.style.borderRadius = '15px';
                    node.style.padding = '8px 12px';
                    node.style.border = '2px solid #e0e0e0';
                    node.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }
                
                // 添加悬停效果
                node.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)';
                    this.style.transition = 'all 0.3s ease';
                });
                
                node.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
            
            // 自定义连接线样式
            const lines = mindmapContainer.querySelectorAll('path');
            lines.forEach(line => {
                line.style.stroke = '#558B2F';
                line.style.strokeWidth = '2px';
                line.style.filter = 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))';
            });
        }, 100);
        
    } catch (error) {
        console.error('jsMind初始化失败:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'text-center text-danger h-100 d-flex align-items-center justify-content-center';
        errorMessage.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>思维导图渲染失败';
        mindmapContainer.appendChild(errorMessage);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 元素选择器
    const uploadForm = document.getElementById('upload-form');
    const videoUpload = document.getElementById('video-upload');
    const loadingSpinner = document.getElementById('loading-spinner');
    const uploadSection = document.getElementById('upload-section');
    const uploadSuccess = document.getElementById('upload-success');
    const resultContainer = document.getElementById('result-container');
    const videoPlayer = document.getElementById('video-player');
    const summaryText = document.getElementById('summary-text');
    const mindmapContainer = document.getElementById('mindmap-container');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-question');
    const chatMessages = document.getElementById('chat-messages');
    const copySummaryBtn = document.getElementById('copy-summary');
    const playbackControls = document.querySelectorAll('.playback-controls button');
    const downloadMindmapBtn = document.getElementById('download-mindmap');
    
    // 分析进度条相关元素
    const analysisSection = document.getElementById('analysis-section');
    const progressBar = document.getElementById('analysis-progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressTime = document.getElementById('progress-time');
    const analysisStatus = document.getElementById('analysis-status');
    
    // 分析状态消息数组
    const analysisMessages = [
        "初始化分析引擎...",
        "加载视频帧...",
        "提取视频关键帧...",
        "分析视频内容...",
        "识别视频场景...",
        "生成文本摘要...",
        "构建思维导图...",
        "优化分析结果...",
        "完成分析..."
    ];
    
    // jsMind自带缩放功能，无需额外控制
    
    // 状态变量
    let videoData = null;
    let xmindPath = null;

    // 设置聊天功能
    function setupChat() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatInput || !sendButton || !chatMessages) {
            return; // 如果元素不存在，直接返回
        }
        
        // 发送消息函数
        function sendMessage() {
            const question = chatInput.value.trim();
            if (!question) return;
            
            // 添加用户消息
            addMessage(question, 'user');
            chatInput.value = '';
            
            // 发送到后端
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: question })
            })
            .then(response => response.json())
            .then(data => {
                // 添加AI回复
                addMessage(data.answer, 'bot');
            })
            .catch(error => {
                console.error('聊天错误:', error);
                addMessage('抱歉，我现在无法回答您的问题。', 'bot');
            });
        }
        
        // 添加消息到聊天区域
        function addMessage(content, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}-message`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            if (type === 'bot') {
                messageContent.innerHTML = `<i class="bi bi-robot me-2"></i>${content}`;
            } else {
                messageContent.innerHTML = `<i class="bi bi-person me-2"></i>${content}`;
            }
            
            messageDiv.appendChild(messageContent);
            chatMessages.appendChild(messageDiv);
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // 绑定事件
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // 文件选择自动上传处理
    videoUpload.addEventListener('change', function(e) {
        const file = this.files[0];
        if (file) {
            // 显示加载中
            loadingSpinner.classList.remove('d-none');
            
            // 检查文件大小
            if (file.size > 50 * 1024 * 1024) { // 50MB
                alert('文件大小超出限制（50MB）');
                loadingSpinner.classList.add('d-none');
                return;
            }
            
            // 准备FormData
            const formData = new FormData();
            formData.append('video', file);
            
            // 发送上传请求
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('上传失败');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    // 隐藏上传区域和加载动画
                    uploadSection.classList.add('d-none');
                    loadingSpinner.classList.add('d-none');
                    
                    // 显示上传成功提示
                    uploadSuccess.style.display = 'block';
                    
                    // 延迟跳转到结果页面
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 2000);
                } else {
                    loadingSpinner.classList.add('d-none');
                    alert(data.error || '上传失败');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // 如果上传失败，退回到使用模板数据
                uploadSection.classList.add('d-none');
                loadingSpinner.classList.add('d-none');
                analysisSection.classList.remove('d-none');
                
                // 获取模板数据并模拟进度
                fetch('/template-data')
                    .then(response => response.json())
                    .then(templateData => {
                        simulateAnalysisProgress(templateData);
                    })
                    .catch(err => {
                        console.error('Error:', err);
                        simulateAnalysisProgress(null); // 使用默认模板数据
                    });
            });
        }
    });
    
    // 模拟分析进度
    function simulateAnalysisProgress(data) {
        let progress = 0;
        const totalTime = 3000; // 总共3秒
        const interval = 100; // 每100毫秒更新一次
        const steps = totalTime / interval;
        const increment = 100 / steps;
        
        // 初始化进度条和状态消息
        progressBar.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', '0');
        progressBar.textContent = '0%';
        progressText.textContent = '0%';
        progressTime.textContent = '预计剩余时间: 3 秒';
        analysisStatus.textContent = analysisMessages[0];
        
        // 创建进度更新定时器
        const progressTimer = setInterval(() => {
            progress += increment;
            const currentProgress = Math.min(Math.round(progress), 100);
            const remainingTime = Math.max(Math.round((100 - currentProgress) * 3 / 100), 0);
            
            // 更新进度条和文本
            progressBar.style.width = currentProgress + '%';
            progressBar.setAttribute('aria-valuenow', currentProgress);
            progressBar.textContent = currentProgress + '%';
            progressText.textContent = currentProgress + '%';
            progressTime.textContent = `预计剩余时间: ${remainingTime} 秒`;
            
            // 更新分析状态消息
            const messageIndex = Math.min(Math.floor(currentProgress / (100 / (analysisMessages.length - 1))), analysisMessages.length - 1);
            analysisStatus.textContent = analysisMessages[messageIndex];
            
            // 分析完成
            if (currentProgress >= 100) {
                clearInterval(progressTimer);
                
                // 延迟一小会儿后显示结果
                setTimeout(() => {
                    analysisSection.classList.add('d-none');
                    // 处理上传成功
                    if (data) {
                        handleUploadSuccess(data);
                    } else {
                        // 如果没有数据，使用内置的模板数据
                        videoData = templateData;
                        
                        try {
                            if (videoPlayer) {
                                // 清空现有内容
                                videoPlayer.innerHTML = '';
                                
                                // 创建新的source元素
                                const source = document.createElement('source');
                                source.id = 'video-source';
                                source.src = '/fixed-video';
                                source.type = 'video/mp4';
                                
                                // 添加source到video元素
                                videoPlayer.appendChild(source);
                                
                                // 设置视频播放器属性
                                videoPlayer.controls = true;
                                videoPlayer.style.backgroundColor = "#000";
                                videoPlayer.preload = 'auto';
                                videoPlayer.style.display = 'block';
                                
                                // 确保任何错误信息被隐藏
                                const videoErrorDiv = document.getElementById('video-error');
                                if (videoErrorDiv) {
                                    videoErrorDiv.classList.add('d-none');
                                }
                                
                                videoPlayer.load();
                            }
                        } catch (error) {
                            console.error("设置视频元素时出错:", error);
                        }
                        
                        // 显示摘要
                        if (summaryText) {
                            summaryText.textContent = templateData.summary;
                        }
                        
                        // 显示结果
                        if (resultContainer) {
                            resultContainer.classList.remove('d-none');
                        }
                        
                        // 确保思维导图容器有足够的高度
                        if (mindmapContainer) {
                            mindmapContainer.style.minHeight = '400px';
                            
                            // 渲染思维导图
                            setTimeout(() => {
                                renderMindmap(templateData.mindmap);
                            }, 100);
                        }
                    }
                }, 500);
            }
        }, interval);
    }
    
    // 统一处理上传成功的函数
    function handleUploadSuccess(data) {
        // 保存返回的数据
        videoData = data;
        xmindPath = data.xmind_path;
        
        // 调试信息
        console.log("上传成功，获取到视频路径:", data.video_path);
        
        try {
            // 重置视频元素
            videoPlayer.innerHTML = '';
            
            // 创建新的source元素
            const source = document.createElement('source');
            source.id = 'video-source';
            source.src = data.video_path;
            source.type = 'video/mp4';  // 固定为MP4类型
            
            // 添加source到video元素
            videoPlayer.appendChild(source);
            
            // 设置视频播放器属性
            videoPlayer.controls = true;
            videoPlayer.style.backgroundColor = "#000";
            videoPlayer.preload = 'auto';
            videoPlayer.style.display = 'block';
            
            // 确保任何错误信息被隐藏
            const videoErrorDiv = document.getElementById('video-error');
            if (videoErrorDiv) {
                videoErrorDiv.classList.add('d-none');
            }
            
            // 视频加载的调试信息
            videoPlayer.addEventListener('loadeddata', function onLoaded() {
                console.log("视频已加载完成，可以播放");
                // 移除事件监听器以避免重复
                videoPlayer.removeEventListener('loadeddata', onLoaded);
            });
            
            // 视频加载失败的处理
            videoPlayer.addEventListener('error', function onError(e) {
                console.error("视频加载错误:", videoPlayer.error);
                console.error("错误详情:", e);
                
                // 显示错误信息
                if (videoErrorDiv) {
                    videoPlayer.style.display = 'none';
                    videoErrorDiv.classList.remove('d-none');
                }
                
                alert("视频加载失败，请尝试刷新页面或重新上传");
                // 移除事件监听器以避免重复
                videoPlayer.removeEventListener('error', onError);
            });
            
            // 强制加载视频
            videoPlayer.load();
            console.log("视频加载请求已发送");
        } catch (error) {
            console.error("设置视频元素时出错:", error);
        }
        
        // 显示摘要
        summaryText.textContent = data.summary;
        
        // 隐藏上传区域，显示结果
        uploadSection.classList.add('d-none');
        resultContainer.classList.remove('d-none');
        
        // 确保思维导图容器有足够的高度
        mindmapContainer.style.minHeight = '400px';
        
        // 延迟渲染思维导图，确保DOM已更新
        setTimeout(() => {
            renderMindmap(data.mindmap);
        }, 100);
    }
    
    // 预加载模板数据，确保思维导图能正确渲染
    fetch('/template-data')
        .then(response => response.json())
        .then(data => {
            xmindPath = data.xmind_path;
            console.log('模板数据预加载成功');
        })
        .catch(error => {
            console.error('模板数据预加载失败:', error);
        });
    
    // 默认模板数据
//     const templateData = {
//         summary: `这个视频介绍了ChatGPT Prompt工程，主要由OpenAI的Isa Fulford和DeepLearning.AI的Andrew Ng讲解。
    
// 视频的主要内容包括：
// 1. 如何利用大语言模型(LLM)API构建软件应用
// 2. Prompt工程的重要性和实践技巧
// 3. ChatGPT模型的特性和适用场景
// 4. 如何优化提示词以获得更好的结果
    
// 讲者强调了良好的prompt设计可以提高LLM的效率和安全性，并且分享了一系列实用技巧。`,
//         mindmap: {
//             root: {
//                 text: "ChatGPT Prompt工程",
//                 children: [
//                     {
//                         text: "基础概念",
//                         children: [
//                             {text: "什么是LLM"},
//                             {text: "API使用方法"},
//                             {text: "Prompt设计原则"}
//                         ]
//                     },
//                     {
//                         text: "实践技巧",
//                         children: [
//                             {text: "明确指令"},
//                             {text: "提供示例"},
//                             {text: "分割复杂任务"}
//                         ]
//                     },
//                     {
//                         text: "应用场景",
//                         children: [
//                             {text: "文本生成"},
//                             {text: "内容总结"},
//                             {text: "对话系统"}
//                         ]
//                     }
//                 ]
//             }
//         }
//     };
// 默认模板数据
const templateData = {
    summary: `# AI 摘要：ChatGPT Prompt Engineering for Developers - Introduction
  
  ## 摘要
  
  本视频是关于面向开发者的 ChatGPT Prompt Engineering 课程的介绍。课程将教授如何利用大型语言模型（LLM）的API来快速构建软件应用，重点介绍instruction-tuned LLM的最佳实践。课程内容包括软件开发的prompting技巧、常见用例（如总结、推断、转换、扩展）以及构建聊天机器人。本课程旨在激发开发者对LLM应用的新想法。
  
  ### 亮点
  
  - 💡 LLM作为开发者工具的潜力被低估，通过API调用LLM可以快速构建软件应用。#LLM #API #SoftwareDevelopment
  - 📚 区分了基础LLM和instruction-tuned LLM，后者经过训练能更好地遵循指令，更安全可靠，是当前实际应用的主流选择。#BaseLLM #InstructionTunedLLM #RLHF
  - 🎯 instruction-tuned LLM 专注于提供有帮助、诚实和无害的输出，降低了产生有害文本的可能性。#Helpful #Honest #Harmless
  - ✍ 编写清晰明确的指令对于LLM的有效工作至关重要，就像指导一个聪明但不熟悉任务细节的人一样。#ClearInstructions #SpecificInstructions #Prompting
  - 🧠 明确指令的细节，例如文本的重点、风格，甚至提供参考资料，可以显著提高LLM完成任务的质量。#Tone #Context #ReferenceMaterial
  
  #ChatGPT #PromptEngineering #DeepLearning
  
  ### 思考
  
  - 如何选择适合特定任务的基础LLM或instruction-tuned LLM？
  - 在实际开发中，如何评估和改进LLM生成的文本质量？`,
  
    mindmap: {
      root: {
        text: "ChatGPT Prompt工程",
        children: [
          {
            text: "基础概念",
            children: [
              { text: "💡开发者ChatGPT提示工程" },
              { text: "💡 LLM应用速成" },
              { text: "💡 指令调整LLM" }
            ]
          },
          {
            text: "实践技巧",
            children: [
              { text: "💡 指令微调大语言模型" },
              { text: "🎯 指令调优LLM：应用首选" }
            ]
          },
          {
            text: "应用场景",
            children: [
              { text: "💡 指令清晰度至上" },
              { text: "💡提示词工程要点" }
            ]
          }
        ]
      }
    }
  };
    
    // 处理文件上传 - 保留这个监听器以防用户直接提交表单
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 显示加载中
        loadingSpinner.classList.remove('d-none');
        
        const file = videoUpload.files[0];
        
        if (file) {
            // 有文件但用户点击了提交，仍然处理上传
            // 检查文件大小
            if (file.size > 50 * 1024 * 1024) { // 50MB
                alert('文件大小超出限制（50MB）');
                loadingSpinner.classList.add('d-none');
                return;
            }
            
            // 准备FormData
            const formData = new FormData();
            formData.append('video', file);
            
            // 发送上传请求
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('上传失败');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    // 隐藏上传区域和加载动画
                    uploadSection.classList.add('d-none');
                    loadingSpinner.classList.add('d-none');
                    
                    // 显示上传成功提示
                    uploadSuccess.style.display = 'block';
                    
                    // 延迟跳转到结果页面
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 2000);
                } else {
                    loadingSpinner.classList.add('d-none');
                    alert(data.error || '上传失败');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                uploadSection.classList.add('d-none');
                loadingSpinner.classList.add('d-none');
                analysisSection.classList.remove('d-none');
                
                // 获取模板数据并模拟进度
                fetch('/template-data')
                    .then(response => response.json())
                    .then(templateData => {
                        simulateAnalysisProgress(templateData);
                    })
                    .catch(err => {
                        console.error('Error:', err);
                        simulateAnalysisProgress(null); // 使用默认模板数据
                    });
            });
        } else {
            // 没有选择文件，使用模板数据
            uploadSection.classList.add('d-none');
            loadingSpinner.classList.add('d-none');
            analysisSection.classList.remove('d-none');
            
            // 获取模板数据并模拟进度
            fetch('/template-data')
                .then(response => response.json())
                .then(templateData => {
                    simulateAnalysisProgress(templateData);
                })
                .catch(err => {
                    console.error('Error:', err);
                    simulateAnalysisProgress(null); // 使用默认模板数据
                });
        }
    });
    
    // 使用模板数据的函数
    function useTemplateData() {
        // 隐藏上传区域和加载动画
        uploadSection.classList.add('d-none');
        loadingSpinner.classList.add('d-none');
        
        // 显示分析进度区域
        analysisSection.classList.remove('d-none');
        
        // 获取模板数据并模拟进度
        fetch('/template-data')
            .then(response => response.json())
            .then(templateData => {
                simulateAnalysisProgress(templateData);
            })
            .catch(err => {
                console.error('Error:', err);
                simulateAnalysisProgress(null); // 使用默认模板数据
            });
    }
    
    // 下载思维导图
    if (downloadMindmapBtn) {
        downloadMindmapBtn.addEventListener('click', function() {
        // 如果没有xmindPath，从服务器获取模板数据
        if (!xmindPath) {
            fetch('/template-data')
                .then(response => response.json())
                .then(data => {
                    xmindPath = data.xmind_path;
                    window.open(`/download-mindmap?path=${encodeURIComponent(xmindPath)}`, '_blank');
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('获取思维导图失败，请稍后再试');
                });
        } else {
            window.open(`/download-mindmap?path=${encodeURIComponent(xmindPath)}`, '_blank');
        }
        });
    }
    
    // 播放速度控制
    if (playbackControls.length > 0) {
        playbackControls.forEach(button => {
            button.addEventListener('click', function() {
                const speed = parseFloat(this.getAttribute('data-speed'));
                videoPlayer.playbackRate = speed;
                
                // 更新活动状态
                playbackControls.forEach(btn => btn.classList.remove('active', 'btn-secondary'));
                this.classList.add('active', 'btn-secondary');
            });
        });
    }
    
    // 复制总结文本
    if (copySummaryBtn) {
        copySummaryBtn.addEventListener('click', function() {
            // 获取摘要内容区域
            const summaryContainer = document.querySelector('.summary-content');
            let textToCopy = '';
            
            if (summaryContainer) {
                // 提取所有文本内容，包括标题和列表
                const summaryElements = summaryContainer.querySelectorAll('.summary-text, .summary-title, .summary-list li, .highlight-text');
                const textParts = [];
                
                summaryElements.forEach(element => {
                    const text = element.textContent.trim();
                    if (text) {
                        if (element.classList.contains('summary-title')) {
                            textParts.push('\n' + text + '\n');
                        } else if (element.tagName === 'LI') {
                            textParts.push('• ' + text);
                        } else {
                            textParts.push(text);
                        }
                    }
                });
                
                textToCopy = textParts.join('\n').trim();
            }
            
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        const originalHTML = this.innerHTML;
                        this.innerHTML = '<i class="bi bi-check me-1"></i>已复制!';
                        setTimeout(() => {
                            this.innerHTML = originalHTML;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('无法复制文本: ', err);
                        alert('复制失败，请手动选择文本复制');
                    });
            }
        });
    }
    
    // 发送问题到聊天
    function sendQuestion() {
        const question = chatInput.value.trim();
        if (!question) return;
        
        // 添加用户消息到聊天区域
        addMessage(question, 'user');
        chatInput.value = '';
        
        // 在发送请求前先创建一个空的AI消息占位
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        messageDiv.innerHTML = `<strong>AI:</strong> <span class="typing-text"></span><span class="typing-cursor">|</span>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 获取打字效果的元素
        const typingText = messageDiv.querySelector('.typing-text');
        const typingCursor = messageDiv.querySelector('.typing-cursor');
        
        // 让光标闪烁
        let cursorVisible = true;
        const cursorInterval = setInterval(() => {
            if (cursorVisible) {
                typingCursor.style.opacity = '0';
            } else {
                typingCursor.style.opacity = '1';
            }
            cursorVisible = !cursorVisible;
        }, 500);
        
        // 延迟2秒，模拟思考时间
        setTimeout(() => {
            // 发送到服务器
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question })
            })
            .then(response => response.json())
            .then(data => {
                // 使用打字效果显示回复
                typeText(data.answer, typingText, typingCursor, cursorInterval);
            })
            .catch(error => {
                console.error('Error:', error);
                // 使用打字效果显示错误信息
                typeText('抱歉，处理您的问题时出错了', typingText, typingCursor, cursorInterval);
            });
        }, 2000);
    }
    
    // 打字效果函数
    function typeText(text, element, cursor, cursorInterval) {
        let index = 0;
        const chars = [...text]; // 将文本拆分为字符数组
        
        function typeNextChar() {
            if (index < chars.length) {
                // 添加下一个字符
                element.textContent += chars[index];
                index++;
                
                // 滚动到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // 随机延迟，使打字效果更自然
                const baseDelay = 100; // 基础延迟100ms (约每秒10个字)
                const randomVariation = Math.random() * 40 - 20; // -20ms到+20ms的随机变化
                const delay = baseDelay + randomVariation;
                
                setTimeout(typeNextChar, delay);
            } else {
                // 打字完成，停止光标闪烁并隐藏光标
                clearInterval(cursorInterval);
                cursor.style.display = 'none';
            }
        }
        
        // 开始打字
        typeNextChar();
    }
    
    // 添加消息到聊天区域 - 仅用于用户消息
    function addMessage(text, sender) {
        if (sender !== 'user') return; // 机器人消息现在通过打字效果添加
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        messageDiv.classList.add('user-message');
        messageDiv.innerHTML = `<strong>您:</strong> ${text}`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 聊天输入事件
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendQuestion();
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', sendQuestion);
    }
    
    // jsMind自带缩放功能，无需额外的缩放控制代码
    
    // renderMindmap函数已移至全局作用域
});