<template>
  <div class="timeline-container">
    <a-timeline>
      <a-timeline-item :color="getColor(item?.type)" v-for="(item, index) in data" :key="index">
        <template #dot>
          <NotificationOutlined />
        </template>
        <div class="timeline-content" :style="'color:' + getColor(item?.type)">
          <div class="content" :class="{ important: item.type === 'important' ? true : false }">
            <a-tag :bordered="false" color="red">{{ item.time }}</a-tag>
            {{ item?.content }}
          </div>
        </div>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NotificationOutlined } from '@ant-design/icons-vue'
const props = defineProps({
  data: {
    type: Array,
    default: () => [
      {
        id: 1, // 建议为每个数据项添加唯一ID
        time: '15:30',
        type: 'normal',
        content: '【市场消息】据彭博：欧元区4月份通胀年率初值4.5%，预期4.5%，前值5.0%。'
      },
      {
        id: 2,
        time: '15:25',
        type: 'important', // 这条会被标记为重要颜色
        content:
          '【突发！某大型科技公司宣布重大人事变动，CEO即日离职】据内部消息，科技巨头XYZ公司今日紧急宣布，其创始人兼首席执行官张某因个人原因辞去所有职务，即日生效。公司股价盘后震荡。'
      },
      {
        id: 3,
        time: '15:15',
        type: 'normal',
        content:
          '【行业动态】中国汽车工业协会表示，预计今年汽车产销将保持稳定增长态势，新能源汽车渗透率有望继续提升。'
      },
      {
        id: 4,
        time: '15:05',
        type: 'normal',
        content:
          '【公司财报】XX银行发布2023年第一季度财报，实现净利润同比增长8%，资产质量保持稳定。'
      },
      {
        id: 5,
        time: '14:50',
        type: 'important', // 这条会被标记为重要颜色
        content:
          '【央行最新表态】央行有关负责人表示，将继续实施稳健的货币政策，保持流动性合理充裕，引导金融机构加大对实体经济的支持力度。'
      },
      {
        id: 6,
        time: '14:30',
        type: 'normal',
        content: '【国际油价】布伦特原油期货价格震荡上行，WTI原油期货小幅回调。'
      },
      {
        id: 7,
        time: '14:10',
        type: 'normal',
        content: '【国内期货】焦炭、铁矿石期货主力合约盘中触及涨停，有色金属普涨。'
      },
      {
        id: 8,
        time: '13:55',
        type: 'normal',
        content:
          '【上市公司公告】某上市公司披露重大资产重组进展，拟收购同行业优质资产，股票今日复牌。'
      },
      {
        id: 9,
        time: '13:40',
        type: 'normal',
        content: '【A股午后】三大指数小幅翻红，半导体板块领涨，消费板块表现低迷。'
      },
      {
        id: 10,
        time: '13:20',
        type: 'important', // 这条会被标记为重要颜色
        content:
          '【国家发展改革委：正研究出台促进民间投资的政策举措】国家发展改革委表示，将围绕拓宽投资领域、优化投资环境、强化要素保障等方面，进一步细化支持政策，激发民间投资活力。'
      }
    ]
  }
})

const getColor = (type: string) => {
  return type == 'important' ? 'var(--color-danger)' : 'var(--text-primary)'
  // '#00CCFF'
}
</script>

<style scoped lang="scss">
.timeline-container {
  height: 100%;
  overflow: auto;
  width: 100%;
  .timeline-content {
    font-size: 15px;
    padding: 10px;
    // background-color: #f5f5f5;
    border-bottom: 1px solid var(--border-secondary);
    // border-radius: 0.5rem;
    .content {
      &.important {
        font-weight: 700 !important;
      }
    }
  }
}
</style>
