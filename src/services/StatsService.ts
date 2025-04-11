import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { GitCommit } from './GitService'

dayjs.extend(weekOfYear)

export type ChartType = 'pie' | 'bar' | 'line'

export interface StatItem {
  name: string
  count: number
  percentage: number
  filesChanged?: number
  insertions?: number
  deletions?: number
}

export interface CommitStats {
  totalCommits: number
  totalRepositories: number
  totalAuthors: number
  totalFilesChanged: number
  totalInsertions: number
  totalDeletions: number
  authorStats: StatItem[]
  dateStats: StatItem[]
  repositoryStats: StatItem[]
  hourStats: StatItem[]
}

export class StatsService {
  calculateStats(commits: GitCommit[]): CommitStats {
    const authorMap = new Map<
      string,
      { count: number; filesChanged: number; insertions: number; deletions: number }
    >()
    const dateMap = new Map<
      string,
      { count: number; filesChanged: number; insertions: number; deletions: number }
    >()
    const repoMap = new Map<
      string,
      { count: number; filesChanged: number; insertions: number; deletions: number }
    >()
    const hourMap = new Map<
      string,
      { count: number; filesChanged: number; insertions: number; deletions: number }
    >()

    const repositories = new Set<string>()
    const authors = new Set<string>()

    let totalFilesChanged = 0
    let totalInsertions = 0
    let totalDeletions = 0

    commits.forEach((commit) => {
      // 作者统计
      const authorKey = commit.author
      const authorStats = authorMap.get(authorKey) || {
        count: 0,
        filesChanged: 0,
        insertions: 0,
        deletions: 0
      }
      authorStats.count += 1
      authorStats.filesChanged += commit.filesChanged || 0
      authorStats.insertions += commit.insertions || 0
      authorStats.deletions += commit.deletions || 0
      authorMap.set(authorKey, authorStats)
      authors.add(authorKey)

      // 日期统计
      const dateKey = dayjs(commit.date).format('YYYY-MM-DD')
      const dateStats = dateMap.get(dateKey) || {
        count: 0,
        filesChanged: 0,
        insertions: 0,
        deletions: 0
      }
      dateStats.count += 1
      dateStats.filesChanged += commit.filesChanged || 0
      dateStats.insertions += commit.insertions || 0
      dateStats.deletions += commit.deletions || 0
      dateMap.set(dateKey, dateStats)

      // 仓库统计
      const repoKey = commit.repository
      const repoStats = repoMap.get(repoKey) || {
        count: 0,
        filesChanged: 0,
        insertions: 0,
        deletions: 0
      }
      repoStats.count += 1
      repoStats.filesChanged += commit.filesChanged || 0
      repoStats.insertions += commit.insertions || 0
      repoStats.deletions += commit.deletions || 0
      repoMap.set(repoKey, repoStats)
      repositories.add(repoKey)

      // 小时统计
      const hour = dayjs(commit.date).format('HH')
      const hourKey = `${hour}:00`
      const hourStats = hourMap.get(hourKey) || {
        count: 0,
        filesChanged: 0,
        insertions: 0,
        deletions: 0
      }
      hourStats.count += 1
      hourStats.filesChanged += commit.filesChanged || 0
      hourStats.insertions += commit.insertions || 0
      hourStats.deletions += commit.deletions || 0
      hourMap.set(hourKey, hourStats)

      // 总计
      totalFilesChanged += commit.filesChanged || 0
      totalInsertions += commit.insertions || 0
      totalDeletions += commit.deletions || 0
    })

    // 统计作者
    const authorStats = Array.from(authorMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        percentage: stats.count / commits.length,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions
      }))
      .sort((a, b) => b.count - a.count)

    // 统计日期
    const dateStats = Array.from(dateMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        percentage: stats.count / commits.length,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions
      }))
      .sort((a, b) => dayjs(a.name).unix() - dayjs(b.name).unix())

    // 统计仓库
    const repositoryStats = Array.from(repoMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        percentage: stats.count / commits.length,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions
      }))
      .sort((a, b) => b.count - a.count)

    // 统计小时
    const hourStats = Array.from(hourMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        percentage: stats.count / commits.length,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.name.split(':')[0])
        const hourB = parseInt(b.name.split(':')[0])
        return hourA - hourB
      })

    return {
      totalCommits: commits.length,
      totalRepositories: repositories.size,
      totalAuthors: authors.size,
      totalFilesChanged,
      totalInsertions,
      totalDeletions,
      authorStats,
      dateStats,
      repositoryStats,
      hourStats
    }
  }

  // 按时间单位分组数据
  groupDataByTimeUnit(stats: CommitStats, timeUnit: string): StatItem[] {
    const grouped = new Map<
      string,
      { count: number; filesChanged: number; insertions: number; deletions: number }
    >()

    stats.dateStats.forEach((item) => {
      const date = dayjs(item.name)
      let key: string

      switch (timeUnit) {
        case 'week':
          key = `${date.year()}-W${date.week()}`
          break
        case 'month':
          key = date.format('YYYY-MM')
          break
        default: // day
          key = date.format('YYYY-MM-DD')
      }

      const groupStats = grouped.get(key) || {
        count: 0,
        filesChanged: 0,
        insertions: 0,
        deletions: 0
      }
      groupStats.count += item.count
      groupStats.filesChanged += item.filesChanged || 0
      groupStats.insertions += item.insertions || 0
      groupStats.deletions += item.deletions || 0
      grouped.set(key, groupStats)
    })

    return Array.from(grouped.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        percentage: stats.count / stats.count,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions
      }))
      .sort((a, b) => {
        // 确保时间按正确顺序排序
        if (timeUnit === 'week') {
          const [yearA, weekA] = a.name.split('-W').map(Number)
          const [yearB, weekB] = b.name.split('-W').map(Number)
          return yearA !== yearB ? yearA - yearB : weekA - weekB
        }
        return a.name.localeCompare(b.name)
      })
  }

  // 获取图表数据
  getChartData(
    stats: CommitStats,
    timeUnit = 'day',
    topLimit = 10,
    chartTypes = {
      author: 'pie' as ChartType,
      date: 'line' as ChartType,
      repo: 'bar' as ChartType,
      hour: 'bar' as ChartType
    }
  ) {
    // 对数据进行处理，限制显示前topLimit条
    const topAuthors = [...stats.authorStats].slice(0, topLimit)
    const topRepos = [...stats.repositoryStats].slice(0, topLimit)

    // 按时间单位分组数据
    const groupedDateStats = this.groupDataByTimeUnit(stats, timeUnit)

    return {
      authorChart: this.createChart('按作者统计', topAuthors, chartTypes.author),
      dateChart: this.createChart(
        `按${this.getTimeUnitLabel(timeUnit)}统计`,
        groupedDateStats,
        chartTypes.date
      ),
      repositoryChart: this.createChart('按仓库统计', topRepos, chartTypes.repo),
      hourChart: this.createChart('提交时间分布', stats.hourStats, chartTypes.hour)
    }
  }

  private getTimeUnitLabel(timeUnit: string): string {
    switch (timeUnit) {
      case 'week':
        return '周'
      case 'month':
        return '月'
      default:
        return '日'
    }
  }

  private createChart(title: string, data: StatItem[], chartType: ChartType) {
    // 通用配置
    const baseOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: chartType === 'pie' ? 'item' : 'axis',
        formatter:
          chartType === 'pie'
            ? '{b}: {c} ({d}%)'
            : (params: any) => {
                const firstParam = Array.isArray(params) ? params[0] : params
                return `${firstParam.name}<br/>${firstParam.seriesName}: ${firstParam.value}`
              }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      }
    }

    // 根据图表类型创建不同的图表配置
    if (chartType === 'pie') {
      return {
        ...baseOption,
        series: [
          {
            name: '数量',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data.map((item) => ({
              name: item.name,
              value: item.count
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} ({d}%)'
            }
          }
        ]
      }
    } else {
      // 条形图或线图
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map((item) => item.name),
          axisLabel: {
            rotate: chartType === 'bar' ? 45 : 0,
            interval: 0,
            formatter: (value: string) => {
              // 截断过长的名称
              if (value.length > 10) {
                return value.substr(0, 7) + '...'
              }
              return value
            }
          }
        },
        yAxis: {
          type: 'value'
        },
        dataZoom:
          data.length > 10
            ? [
                {
                  type: 'slider',
                  start: 0,
                  end: 100 * (10 / data.length)
                }
              ]
            : [],
        series: [
          {
            name: '提交数',
            type: chartType,
            data: data.map((item) => item.count),
            itemStyle: {
              color: chartType === 'line' ? '#07C160' : null
            },
            smooth: chartType === 'line' ? 0.4 : undefined,
            areaStyle: chartType === 'line' ? { opacity: 0.2 } : undefined
          }
        ]
      }
    }
  }
}

export const statsService = new StatsService()
