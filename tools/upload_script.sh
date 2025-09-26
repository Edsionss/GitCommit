#!/bin/bash

# --- ⚠️ 配置区：请根据你的情况修改以下变量 ---

# 1. 你的远程Git仓库地址
GIT_REPO_URL="http://111.22.163.233:36080/dev/uniapp.git"
# GIT_REPO_URL="https://github.com/Edsionss/fuck.git"

# 2. 存放所有项目文件夹的父目录 (绝对路径或相对路径)
#    例如 "./" 表示和脚本在同一目录下
SOURCE_PROJECTS_DIR="D:\NEW project\SVN_OLD\APP"

# 3. 用于操作的临时Git仓库克隆目录名
#    脚本会自动创建这个目录，运行结束后你可以安全地删除它
GIT_TEMP_CLONE_DIR="temp_git_repo"

# 4. 你的仓库的主分支名，用于每次创建新分支的起点
BASE_BRANCH="main"

# --- 脚本执行区：通常无需修改 ---

# 检查源目录是否存在
if [ ! -d "$SOURCE_PROJECTS_DIR" ]; then
  echo "❌ 错误: 源项目目录 '$SOURCE_PROJECTS_DIR' 不存在。"
  exit 1
fi

# 检查临时克隆目录是否已存在，避免冲突
if [ -d "$GIT_TEMP_CLONE_DIR" ]; then
  echo "❌ 错误: 临时目录 '$GIT_TEMP_CLONE_DIR' 已存在。请先删除它或更改变量。"
  exit 1
fi

echo "🚀 开始批量上传..."
echo "----------------------------------------"

# 1. 克隆你的远程仓库到一个临时目录
echo ">>> 步骤 1: 克隆远程仓库到 '$GIT_TEMP_CLONE_DIR'..."
git clone $GIT_REPO_URL $GIT_TEMP_CLONE_DIR

# 检查克隆是否成功
if [ $? -ne 0 ]; then
  echo "❌ 错误: 克隆仓库失败。请检查URL和你的权限。"
  exit 1
fi

# 进入临时仓库目录
cd $GIT_TEMP_CLONE_DIR

echo "✅ 克隆成功。"
echo "----------------------------------------"

# 2. 遍历源项目目录下的所有子目录
for project_path in "$SOURCE_PROJECTS_DIR"/*; do
  # 检查这是否是一个目录
  if [ -d "$project_path" ]; then
    
    # 从项目文件夹路径中提取出文件夹名，作为分支名
    # 同时，对名字进行处理，替换空格等非法字符为'-'
    branch_name=$(basename "$project_path" | tr ' ' '-' | tr -dc '[:alnum:]-./_')
    
    echo ">>> 步骤 2: 正在处理项目 '$branch_name'..."

    # a. 切换回基础分支，并拉取最新，确保每次都从干净的起点开始
    git checkout $BASE_BRANCH
    git pull origin $BASE_BRANCH

    # b. 检查远程是否已存在同名分支，如果存在则跳过
    if git show-ref --quiet --verify "refs/remotes/origin/$branch_name"; then
        echo "🟡 警告: 远程已存在分支 '$branch_name'，跳过此项目。"
        echo "----------------------------------------"
        continue
    fi

    # c. 从基础分支创建新的本地分支
    git checkout -b "$branch_name"

    # d. **【关键步骤】** 清理工作区，删除所有旧文件（除了.git目录）
    # 使用 `git rm` 更安全，它会处理所有已跟踪的文件
    git rm -rf .

    # e. 将项目文件夹的所有内容拷贝到当前工作区
    # `cp -r source/. target/` 语法可以拷贝文件夹内的所有内容（包括隐藏文件）
    echo "    正在拷贝文件从 '$project_path'..."
    cp -r "$project_path"/. .

    # f. 添加所有新文件到暂存区
    git add .

    # g. 检查是否有文件被添加，避免创建空的提交
    if [ -n "$(git status --porcelain)" ]; then
        # h. 提交更改
        echo "    正在提交更改..."
        git commit -m "feat: Initial import of project $branch_name"

        # i. 推送新分支到远程仓库
        echo "    正在推送到远程仓库..."
        git push -u origin "$branch_name"
        echo "✅ 项目 '$branch_name' 已成功上传为新分支。"
    else
        echo "⚪️ 信息: 项目 '$branch_name' 为空或没有变化，跳过提交。"
    fi

    echo "----------------------------------------"
  fi
done

# 3. 清理工作
echo ">>> 步骤 3: 清理临时文件..."
# 切回主分支，回到脚本所在的目录
cd ..
# 删除临时克隆的仓库
rm -rf $GIT_TEMP_CLONE_DIR

echo "🎉 全部完成！所有项目均已作为分支上传。"

# --- 使用说明 ---

# 请使用git bash 运行本脚本

# 1.授权 chmod +x upload_script.sh

# 2.运行 ./upload_script.sh